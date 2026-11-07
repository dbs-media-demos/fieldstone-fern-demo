import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Loaded on demand by lib/gsap.ts: desktop only, so phones never download it.
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "expo.out", duration: 1.1 });

export { gsap, ScrollTrigger };
