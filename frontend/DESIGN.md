# DESIGN.md — The Obsidian Minimalist Design System

## 1. Visual Philosophy & Emotional Tone
* **The Paradigm:** Cinematic Editorial. The app must feel like a premium digital editorial magazine meets an advanced AI workspace. High-contrast typography, massive deliberate whitespace, and crisp, razor-sharp geometric borders.
* **Tone:** Sovereign, calm, high-trust, intentional.
* **Anti-Patterns:** No generic purple/blue gradients, no heavy glassmorphism, no over-rounded cards. 

## 2. Color Token System (Monochromatic Depth)
We ditch standard blue/purple AI palettes for a rich, ink-and-stone structure.
* --bg-cosmic: #050505 (Absolute deep ground)
* --surface-elevation-1: #0F0F11 (Sharp structural blocks)
* --surface-elevation-2: #161619 (Interactive states)
* --border-subtle: #1F1F24 (High-precision divider lines)
* --border-accent: #FFFFFF (Pure white micro-highlights)
* --text-primary: #F5F5F7 (High-readability silk white)
* --text-muted: #8E8E93 (Muted editorial gray)
* --accent-signal: #E24A00 (A single high-energy structural warning/action color)

## 3. Typography Scale (Editorial Hierarchy)
* **Display:** Serif-style tracking for cinematic impact (Playfair Display or custom system serif display).
* **Body and Mono:** High-density geometric tracking (Geist Sans or SF Pro).
* text-xs: 0.75rem / Leaded tighter for labels.
* text-sm: 0.875rem / Standard data readout.
* text-base: 1rem / Editorial reading text.
* text-4xl: 2.25rem / Section focus.
* text-7xl: 4.5rem / Large scale cinematic landing statements.

## 4. Spacing, Radius, & Layout Rules
* **Radius:** Brutalist-adjacent micro-radius. rounded-sm (2px) or rounded-md (4px). Never use generic rounded-2xl or pill shapes for layout engines.
* **Layout Anti-Pattern:** Absolutely no static left-sidebar + top-navbar combination. 
* **New Convention:** Global Floating Focal Deck (an ultra-minimalist, floating interactive panel anchored dynamically based on context—bottom center for chat, top-right for configuration).

## 5. Motion Principles & Interaction Philosophy
* **Transition:** Mass-driven physical inertia. Avoid springy cartoon bounces. Use custom cubic-beziers for precise, cinematic deceleration.
* cubic-bezier(0.16, 1, 0.3, 1) (Ultra-premium ease-out deceleration).
