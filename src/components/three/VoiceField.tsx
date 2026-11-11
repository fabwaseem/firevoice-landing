"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { BANDS, getBands, getLevel, onFrame } from "@/lib/audio-engine";

const W = 24; // field width (world units)
const Z_NEAR = 7;
const Z_FAR = -16;

const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const vertex = /* glsl */ `
uniform float uTime;
uniform float uLevel;
uniform float uPixel;
uniform float uScroll;
uniform float uBands[${BANDS}];
uniform vec2 uMouse;
uniform float uMouseAmp;
varying float vH;
varying float vFade;
${noise}
float band(float u){
  float f = clamp(u, 0.0, 1.0) * ${BANDS - 1}.0;
  int i = int(floor(f));
  int j = min(i + 1, ${BANDS - 1});
  return mix(uBands[i], uBands[j], fract(f));
}
void main(){
  vec3 p = position;
  float x = p.x, z = p.z;
  float t = uTime;

  // the landscape: slow rolling noise
  float n = snoise(vec3(x * 0.16, z * 0.2 - t * 0.22, t * 0.07)) * 0.55
          + snoise(vec3(x * 0.5, z * 0.5 + t * 0.15, t * 0.2)) * 0.12;

  // the voice: a mirrored spectrum running across a ridge, loud in the middle, fading to the sides
  float b = band(abs(x) / (${W / 2}.0 * 0.62));
  float env = exp(-x * x / 46.0);
  float ridgeZ = -1.6;
  float dz = z - ridgeZ;
  float ridge = exp(-dz * dz * 0.42);
  // echoes travel away from the ridge like sound waves
  float echo = sin(dz * 1.7 - t * 3.2) * exp(-abs(dz) * 0.32) * 0.5 + 0.5;
  float voice = b * env * (ridge * 1.6 + echo * 0.55 * (0.4 + uLevel));

  // the cursor ripples the field
  float d = length(vec2(x, z) - uMouse);
  float ripple = sin(d * 2.6 - t * 5.0) * exp(-d * 0.55) * 0.45 * uMouseAmp;

  float y = n + voice + ripple;
  p.y = y;

  vH = n * 0.45 + voice * 0.8 + ripple * 0.7 + 0.3;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float depth = -mv.z;
  vFade = smoothstep(${Z_FAR}.0, ${Z_FAR + 9}.0, z) * (1.0 - smoothstep(${W / 2 - 3}.0, ${W / 2}.0, abs(x)))
        * (0.55 + 0.45 * smoothstep(2.0, 8.5, depth)) * smoothstep(0.4, 1.6, depth);
  gl_PointSize = (2.2 + clamp(vH, 0.0, 1.6) * 3.6) * uPixel * (8.0 / depth);
  gl_Position = projectionMatrix * mv;
}`;

const fragment = /* glsl */ `
varying float vH;
varying float vFade;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  float a = smoothstep(0.5, 0.0, r);
  a *= a;
  float h = clamp(vH, 0.0, 1.6);
  vec3 ember = vec3(0.42, 0.05, 0.02);
  vec3 fire = vec3(1.0, 0.33, 0.1);
  vec3 hot = vec3(1.0, 0.8, 0.55);
  vec3 col = mix(ember, fire, smoothstep(0.05, 0.6, h));
  col = mix(col, hot, smoothstep(0.75, 1.45, h));
  float alpha = a * vFade * (0.1 + h * h * 1.25);
  gl_FragColor = vec4(col, alpha);
}`;

function Field({ cols, rows }: { cols: number; rows: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(cols * rows * 3);
    let k = 0;
    for (let r = 0; r < rows; r++) {
      // rows bunch up near the camera for detail, spread out towards the horizon
      const v = r / (rows - 1);
      const z = Z_NEAR + (Z_FAR - Z_NEAR) * Math.pow(v, 1.35);
      for (let c = 0; c < cols; c++) {
        const jitter = (Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
        pos[k++] = -W / 2 + (W * (c + 0.5 + jitter * 0.3)) / cols;
        pos[k++] = 0;
        pos[k++] = z;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -6), 30);
    return g;
  }, [cols, rows]);

  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uLevel: { value: 0 },
    uPixel: { value: 1 },
    uScroll: { value: 0 },
    uBands: { value: new Float32Array(BANDS) },
    uMouse: { value: new THREE.Vector2(0, -2) },
    uMouseAmp: { value: 0 },
  }));

  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const lastPointer = useRef(new THREE.Vector2(9, 9));

  useFrame((state, dt) => {
    const { pointer, camera, gl } = state;
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value += Math.min(dt, 0.05);
    u.uPixel.value = gl.getPixelRatio();
    u.uLevel.value = getLevel();
    (u.uBands.value as Float32Array).set(getBands());

    // cursor ripple: project the pointer onto the ground plane; the ripple grows while the pointer moves
    ray.setFromCamera(pointer, camera);
    if (ray.ray.intersectPlane(plane, hit)) {
      const m = u.uMouse.value as THREE.Vector2;
      m.x += (hit.x - m.x) * 0.15;
      m.y += (hit.z - m.y) * 0.15;
    }
    const moved = lastPointer.current.distanceTo(pointer);
    lastPointer.current.copy(pointer);
    u.uMouseAmp.value = Math.min(1, u.uMouseAmp.value * 0.96 + moved * 2.2);

    // the camera stays put while the page scrolls (the field is a fixed backdrop); it only sways with the pointer
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (1.75 - camera.position.y) * 0.08;
    camera.lookAt(0, 1.05, -3.2);
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Embers drifting up out of the field. */
function Embers({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const [data] = useState(() => {
    const pos = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = Math.random() * 6 - 0.5;
      pos[i * 3 + 2] = -Math.random() * 12 + 1;
      speed[i] = 0.15 + Math.random() * 0.45;
    }
    return { pos, speed };
  });
  useFrame((_, dt) => {
    const p = ref.current?.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (!p) return;
    const arr = p.array as Float32Array;
    const lift = 1 + getLevel() * 3;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += data.speed[i] * dt * lift;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 1.3 + i) * dt * 0.08;
      if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = -0.5;
    }
    p.needsUpdate = true;
  });
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#ff9a5c"
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function VoiceField({ active, quality }: { active: boolean; quality: "high" | "low" }) {
  const [dpr, setDpr] = useState<[number, number]>(quality === "high" ? [1, 1.75] : [1, 1.25]);
  const [cols, rows] = quality === "high" ? [460, 210] : [220, 110];
  // keep the audio engine's frame loop alive while the field is mounted
  useEffect(() => onFrame(() => {}), []);
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 1.55, 6], fov: 52, near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr([1, 1])} />
      <Field cols={cols} rows={rows} />
      <Embers count={quality === "high" ? 260 : 100} />
    </Canvas>
  );
}
