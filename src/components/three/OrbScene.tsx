"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { subscribeFrame } from "@/lib/voice-level";

/* ---------------------------------------------------------------- shaders */
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
uniform float uTime; uniform float uLevel;
varying vec3 vObj; varying vec3 vViewPos; varying vec3 vSphereN; varying float vDisp;
${noise}
void main(){
  vec3 n = normalize(position);
  float slow  = snoise(n*1.25 + vec3(0.0, uTime*0.18, uTime*0.05)) * 0.04;
  float voice = snoise(n*2.6 + vec3(uTime*0.7)) * (0.01 + uLevel*0.065);
  float d = slow + voice;
  vec3 p = position + normal * d;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vObj = n; vDisp = d; vViewPos = mv.xyz;
  vSphereN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}`;

const fragment = /* glsl */ `
uniform float uLevel; uniform float uDark; uniform float uTime;
varying vec3 vObj; varying vec3 vViewPos; varying vec3 vSphereN; varying float vDisp;
${noise}
void main(){
  vec3 dn = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
  vec3 n = normalize(mix(vSphereN, dn, 0.55));
  vec3 v = normalize(-vViewPos);
  float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.0);
  float flow = snoise(vObj*1.1 + vec3(0.0, uTime*0.22, uTime*0.08)) * 0.5 + 0.5;
  float swirl = snoise(vObj*1.6 - vec3(uTime*0.12, uTime*0.2, 0.0)) * 0.5 + 0.5;

  vec3 darkBase  = mix(vec3(0.10, 0.02, 0.01), vec3(0.50, 0.10, 0.025), smoothstep(0.1, 0.9, flow));
  vec3 lightBase = mix(vec3(1.0, 0.50, 0.28), vec3(0.98, 0.30, 0.12), flow);
  vec3 base = mix(lightBase, darkBase, uDark);
  // light that seems to glow from inside, brighter while the voice is loud
  float inner = pow(clamp(dot(n, v), 0.0, 1.0), 1.5) * (0.25 + 0.75 * pow(swirl * flow, 1.5));
  base += vec3(1.0, 0.42, 0.14) * inner * (0.35 + uLevel * 0.6) * mix(0.35, 1.0, uDark);

  vec3 fire = vec3(1.0, 0.36, 0.12);
  vec3 col = mix(base, fire, smoothstep(0.15, 0.95, fres));
  col += vec3(1.0, 0.78, 0.55) * pow(fres, 4.0) * (0.45 + uLevel * 0.8);
  vec3 h = normalize(normalize(vec3(-0.4, 0.7, 0.8)) + v);
  col += vec3(1.0, 0.85, 0.7) * pow(max(dot(vSphereN, h), 0.0), 80.0) * 0.22;
  col += vec3(1.0, 0.45, 0.15) * smoothstep(0.03, 0.12, vDisp) * 0.18 * uDark;
  // in the light theme, shade the sphere so it reads as a solid object on a pale page
  float diff = clamp(dot(n, normalize(vec3(-0.45, 0.65, 0.6))), 0.0, 1.0);
  col *= mix(0.62 + 0.48 * diff, 1.0, uDark);
  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);
}`;

/* ---------------------------------------------------------------- pieces */
function Orb({ dark }: { dark: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const [initial] = useState(() => ({ uTime: { value: 0 }, uLevel: { value: 0 }, uDark: { value: 1 } }));
  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value += dt;
    u.uLevel.value = levelRef.current;
    u.uDark.value += ((dark ? 1 : 0) - u.uDark.value) * Math.min(1, dt * 4);
  });
  return (
    <mesh>
      <icosahedronGeometry args={[1.12, 48]} />
      <shaderMaterial ref={mat} uniforms={initial} vertexShader={vertex} fragmentShader={fragment} />
    </mesh>
  );
}

const BARS = 140;
function WaveRing({ dark }: { dark: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(() => Array.from({ length: BARS }, (_, i) => Math.sin(i * 12.9898) * 43758.5453 % 1), []);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const level = levelRef.current;
    for (let i = 0; i < BARS; i++) {
      const a = (i / BARS) * Math.PI * 2;
      const wobble =
        0.5 + 0.5 * Math.sin(a * 6 + t * 2.4 + seeds[i] * 3) * Math.sin(a * 3 - t * 1.3);
      const h = 0.03 + level * (0.18 + wobble * 0.55) + wobble * 0.04;
      const r = 1.62 + h / 2;
      dummy.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
      dummy.rotation.set(0, 0, a - Math.PI / 2);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, BARS]}>
      <planeGeometry args={[0.022, 1]} />
      <meshBasicMaterial
        color={dark ? "#ff7a45" : "#ff5a2d"}
        transparent
        opacity={dark ? 0.85 : 0.7}
        blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

function OrbitDots({ dark }: { dark: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 220;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 2.15 + Math.sin(i * 7.1) * 0.05;
      pos.set([Math.cos(a) * r, Math.sin(a) * r * 0.32, Math.sin(a) * r * 0.25], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12;
  });
  return (
    <points ref={ref} geometry={geo} rotation={[0.35, 0, -0.25]}>
      <pointsMaterial
        size={0.025}
        color={dark ? "#ffb184" : "#ff6b3d"}
        transparent
        opacity={dark ? 0.7 : 0.55}
        depthWrite={false}
      />
    </points>
  );
}

const levelRef = { current: 0 };

function Rig({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ pointer }, dt) => {
    if (!g.current) return;
    const k = 1 - Math.exp(-dt * 3);
    g.current.rotation.y += (pointer.x * 0.35 - g.current.rotation.y) * k;
    g.current.rotation.x += (-pointer.y * 0.25 - g.current.rotation.x) * k;
    const s = 1 + levelRef.current * 0.06;
    g.current.scale.setScalar(g.current.scale.x + (s - g.current.scale.x) * k * 2);
  });
  return <group ref={g}>{children}</group>;
}

export default function OrbScene({ dark, active }: { dark: boolean; active: boolean }) {
  const [dpr, setDpr] = useState<[number, number]>([1, 1.75]);
  useEffect(() => subscribeFrame((level) => (levelRef.current = level)), []);
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 5.6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr([1, 1])} />
      <Rig>
        <Orb dark={dark} />
        <WaveRing dark={dark} />
        <OrbitDots dark={dark} />
      </Rig>
      <Sparkles count={50} scale={[7, 5, 3]} size={2.2} speed={0.35} color={dark ? "#ff9a66" : "#ff6b3d"} opacity={0.6} />
    </Canvas>
  );
}
