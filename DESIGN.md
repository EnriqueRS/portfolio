# Design System — Portfolio Enrique Ríos

## Design Direction

**Inspiration anchors:**
- **Linear** — Minimalist dark UI, thin 1px borders, subtle glows, perfect spacing, gradient text on headers
- **Vercel** — Bold hero sections, typography-forward, gradient accents on dark, intentional whitespace
- **Arc Browser** — Glassmorphism, layered translucent panels, backdrop-blur effects, depth through shadows/opacity

**Anti-patterns (NEVER do):**
- NO generic AI dashboard look
- NO card grids of uniform rectangles
- NO Tailwind default blue/indigo palette
- NO white/light backgrounds
- NO boring sidebar+topbar layouts

## Color Palette

```
--bg-primary: #0a0f1e       (deep navy black)
--bg-secondary: #111827      (slightly lighter)
--bg-card: rgba(17, 24, 39, 0.6)  (translucent card)
--border: rgba(255, 255, 255, 0.06)  (barely visible borders)
--text-primary: #f1f5f9      (almost white)
--text-secondary: #94a3b8    (muted slate)
--accent-1: #6366f1          (indigo — accent, NOT primary)
--accent-2: #8b5cf6          (violet)
--accent-3: #06b6d4          (cyan — tech feel)
--gradient-hero: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)
```

## Typography

- **Headings:** Inter or Space Grotesk, bold, letter-spacing -0.02em
- **Body:** Inter, regular, good line-height (1.6+)
- **Code/Tech:** JetBrains Mono or Fira Code
- Gradient text on key headings (background-clip: text)

## Layout

- **Single page** — smooth scroll sections
- **Hero** → About → Experience → Projects → Contact
- **Projects section:** NOT a card grid. Use a bento/masonry-style layout or alternating featured+compact rows. Vary sizes — some projects get large feature blocks, others get subtle compact mentions.
- **Glass panels** with backdrop-blur for cards/sections
- **Subtle animations:** fade-in on scroll, hover glow effects, gradient border on hover

## Sections

1. **Hero** — Name, title, gradient subtitle, animated particles or subtle geometric patterns in background. CTA buttons (GitHub, LinkedIn, Contact)
2. **About** — Short bio from CV, tech stack as animated pills/tags (NOT a blob)
3. **Experience** — Timeline layout (vertical), not a table. Each role with subtle card, glows on hover
4. **Projects** — Bento grid with varying sizes. Featured projects get large cards with screenshots/mockups. Compact projects get icon+name rows. Filter by tech (Java, JS, Vue, etc.)
5. **Contact** — Simple form or just social links with hover animations

## Tech Stack for the Site

- **Framework:** Astro (static, fast, component islands)
- **Styling:** Tailwind CSS (but custom_palette, NOT default blue)
- **Animations:** CSS transitions + Intersection Observer (no heavy libraries)
- **Deploy:** Docker + Cloudflare tunnel

## Micro-interactions

- Nav links: underline slides in on hover
- Project cards: subtle border gradient appears on hover, slight scale(1.02)
- Tech tags: background color shifts on hover
- Section transitions: elements fade in + slight translateY on scroll
- Hero: subtle floating/parallax effect on background elements
