"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Motion for the whole site: one smooth scroller (Lenis) driving GSAP's ScrollTrigger, a hook for scroll scenes, and a
// reveal-on-view wrapper. Everything respects "reduce motion": no smooth scroll, no pinning, content simply shown.

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth scrolling, in step with ScrollTrigger. Mount once on the page. */
export function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, anchors: { offset: -88 } });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    // fonts and images change the page's height: measure the scenes again once they are in
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}

/** A scroll scene: `build` runs inside a GSAP context scoped to `ref` (selectors find only this section's parts) and
 * everything it makes is undone on unmount. Skipped with reduced motion, so set the end state in CSS by default and
 * let `build` animate *from* it. matchMedia lets a scene differ on phones. */
export function useScene<T extends HTMLElement>(build: (ctx: { el: T; mm: gsap.MatchMedia }) => void, deps: unknown[] = []) {
  const ref = useRef<T>(null);
  useIso(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => build({ el, mm }), el);
    return () => {
      mm.revert();
      ctx.revert();
    };
  }, deps);
  return ref;
}

/** Fades its children up the first time they come into view (staggered by `delay`, in ms). With reduced motion the
 * transition is cut to nothing by the stylesheet, so it simply appears. */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div", y = 22 }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" | "span"; y?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translate3d(0, ${y}px, 0)`,
        transition: `opacity 0.9s cubic-bezier(0.25,1,0.5,1) ${delay}ms, transform 0.9s cubic-bezier(0.25,1,0.5,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/** True once the element has been on screen (for starting a looping demo only when it can be seen). */
export function useInView<T extends HTMLElement>(margin = "0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}
