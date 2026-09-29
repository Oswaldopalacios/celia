import type { Variants } from "framer-motion";

export const publicEase = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: publicEase },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: publicEase },
  },
};

export const softScale: Variants = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: publicEase },
  },
};

export const staggerSoft: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.05 },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};
