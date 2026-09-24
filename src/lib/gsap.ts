import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const EASE_OUT_EXPO = 'expo.out'
export const EASE_IN_OUT_QUART = 'quart.inOut'

export { gsap, ScrollTrigger }
