# FutureWise global design system and site shell

## What I’ll build
- Replace the starter screen with a simple FutureWise home placeholder wrapped by a shared header and footer.
- Add the requested Poppins and Inter typography, semantic brand colors, spacing, card radius, shadows, and accessible gradient treatments.
- Build a sticky white header with the FutureWise gradient wordmark, desktop dropdown menus, a mobile navigation menu, and the teal “Take the Survey” action.
- Build the navy footer with mission text, grouped navigation, LinkedIn/contact placeholders, copyright, and Oman Vision 2040 note.
- Add lightweight placeholder pages for every main navigation and dropdown destination, all using the same shell.

## Route structure
- `/`, `/about`, `/about/team`, `/about/project`, `/about/oman-vision-2040`
- `/industry-resources` and one child page for each listed industry topic
- `/living-independently-personal-finance` and one child page for each listed blog/social destination
- `/tools-and-resources` and `/survey`

## Technical details
- Define all colors as OKLCH-backed semantic CSS variables while preserving the requested brand names.
- Load Google Fonts through document-head links and map heading, body, button, and navigation weights globally.
- Use reusable shared layout/navigation components and route-specific metadata for every page.
- Keep teal surfaces paired with navy/charcoal text; reserve white text for navy and blue surfaces.
- Verify the shell at desktop and mobile widths, including dropdown/menu interaction and page navigation.
