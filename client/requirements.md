## Packages
(none needed)

## Notes
Uses existing shadcn/ui components already in repo (Sidebar, Dialog, Form, Table, etc.)
Auth is Replit OIDC via /api/login and /api/logout; use /api/auth/user for current user
All API calls must include credentials: "include"
Dark-mode-first theme is implemented in client/src/index.css via CSS variables; Tailwind uses hsl(var(--...))
