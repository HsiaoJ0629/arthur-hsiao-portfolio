# CLAUDE.md

This file gives Claude Code guidance for working in this repository.

## What this is

A single-page personal portfolio for Arthur Hsiao (Full Stack Developer), built with **Angular 19** standalone components. It also has a live **product management demo** backed by the public [DummyJSON](https://dummyjson.com/) REST API.

- **Live site:** https://hsiaoj0629.github.io/arthur-hsiao-portfolio/home
- **Hosting:** GitHub Pages, as a static prerendered build
- **Default branch:** `master` (CI deploys on every push to it)

## Common commands

```bash
npm start                 # dev server at http://localhost:4200/
npm run build             # production build (SSR + prerender)
npm run build:ghpages     # static build used for GitHub Pages
npm test                  # Karma unit tests
```

## Conventions

- **Standalone components only:** there are no NgModules except `MaterialModule`. Declare dependencies in each component's `imports` array, and import `MaterialModule` for any Material widget.
- **Code style:** services are injected through the constructor, following the existing code. Use `@Input`/`@Output` decorators, not signals.
- **Content lives in TypeScript:** portfolio text is hard-coded in component classes (see "Content" below). There is no CMS or JSON data file.
- **Everything is prerendered:** `app.routes.server.ts` uses `RenderMode.Prerender` for every route. Code must not touch `window`/`document` at construction time without a browser check.
- **GitHub Pages is static:** don't add Express API endpoints in `server.ts` that the live site depends on, because the `ghpages` build has no server.
- **Style budgets:** component SCSS triggers a warning above 4 kB and fails the `ghpages` build above 8 kB. Put shared styles in `src/styles.scss`.
- **Keep skill names in sync:** a skill name in `history.component.ts` must match `skills.component.ts` exactly.

---

## Tech stack

| Area | Technology |
|---|---|
| Framework | Angular 19.2 (standalone components, zone.js) |
| UI | Angular Material 19 + CDK, Bootstrap 5.3, custom SCSS |
| Notifications | ngx-toastr |
| HTTP | `HttpClient` + RxJS 7.8 |
| Rendering | Angular SSR / prerendering (`@angular/ssr`, Express server) |
| Testing | Karma + Jasmine |
| Deployment | GitHub Actions → GitHub Pages; `angular-cli-ghpages` for manual deploys |

---

## Pages and routes

Defined in [src/app/app.routes.ts](src/app/app.routes.ts):

| Path | Component | Notes |
|---|---|---|
| `/home` | `HomeComponent` | Main one-page portfolio |
| `/demo` | `DemoComponent` | Product management demo |
| `/about`, `/contact` | — | Redirect to `/home`, where these are now sections |
| `''`, `**` | — | Redirect to `/home` |

Routing turns on anchor scrolling (`withInMemoryScrolling`), so header links such as `/home#experience` scroll to a section on the page.

The app shell ([app.component.html](src/app/app.component.html)) always shows the **header**, the routed page and the **contact footer**.

---

## Component structure

```
AppComponent
├── HeaderComponent          brand + nav (What I do / Experience / Demo) + "Get in touch"
├── <router-outlet>
│   ├── HomeComponent        hero, services ("What I do"), demo teaser
│   │   └── AboutComponent   "Experience" section
│   │       ├── SummaryComponent   professional summary text
│   │       ├── SkillsComponent    grouped skill chips (clickable filter)
│   │       └── HistoryComponent   work history timeline
│   └── DemoComponent        Material table of products
│       └── ProductEditDialogComponent   (MatDialog) add / edit a product
└── ContactComponent         email (mailto), LinkedIn, copyright year
```

### Notable behaviour

- **Skill filter:** Clicking a skill in `SkillsComponent` emits `selectSkill`. `AboutComponent` passes it to `HistoryComponent`, which highlights the roles that used that skill and fades the others. Clicking the same skill again clears the filter.
- **Demo page** ([demo.component.ts](src/app/components/demo/demo.component.ts)):
  - Server-side search (`products/search?q=`) and pagination (`limit` / `skip`)
  - Client-side sorting with `MatSort`, plus a loading spinner
  - Add and edit products through `ProductEditDialogComponent`, with toastr success/error alerts
  - DummyJSON simulates writes: add and update return a response, but nothing is saved on the server.

### Unused code

- `SideMenuComponent` (Material sidenav layout) is no longer used anywhere. It is left over from the older multi-page layout.

---

## Data layer

[`DummyService`](src/app/service/dummy/dummy.service.ts) (`providedIn: 'root'`), base URL `https://dummyjson.com/`:

| Method | HTTP | Endpoint |
|---|---|---|
| `getProducts(limit, skip?)` | GET | `products?limit=&skip=` |
| `searchProducts(term, limit, skip?)` | GET | `products/search?q=&limit=&skip=` |
| `getProduct(id)` | GET | `products/:id` |
| `addProduct(product)` | POST | `products/add` |
| `updateProduct(product)` | PUT | `products/:id` (sends only title, price, stock) |
| `showAlert(type, message)` | — | Shows a toastr notification |

The models are in [src/app/service/dummy/model/](src/app/service/dummy/model/) (`Product`, `ProductList`).

The Material modules are re-exported together from [src/app/modules/material.module.ts](src/app/modules/material.module.ts).

---

## Content: where to edit personal data

All the portfolio content is hard-coded in the component classes:

| Content | File |
|---|---|
| Services ("What I do"), demo feature list | [home.component.ts](src/app/components/home/home.component.ts) |
| Professional summary | [summary.component.ts](src/app/components/summary/summary.component.ts) |
| Skill groups | [skills.component.ts](src/app/components/skills/skills.component.ts) |
| Work history (company, role, years, responsibilities, skills) | [history.component.ts](src/app/components/history/history.component.ts) |
| Email, LinkedIn URL | [contact.component.ts](src/app/components/contact/contact.component.ts) |
| Page titles | [app.routes.ts](src/app/app.routes.ts) |

Global styles are in [src/styles.scss](src/styles.scss), and the Material theme colours are in [_theme-colors.scss](_theme-colors.scss).

---

## Project layout

```
my-angular-app/
├── .github/workflows/deploy.yml   CI: build + deploy to GitHub Pages on push to master
├── angular.json                   build configs (production, development, ghpages)
├── _theme-colors.scss             Material theme palette
├── public/                        static assets (favicon)
└── src/
    ├── index.html
    ├── main.ts / main.server.ts   browser / server bootstrap
    ├── server.ts                  Express SSR server
    ├── styles.scss
    └── app/
        ├── app.component.*        shell
        ├── app.config.ts          providers (router, hydration, http, animations, toastr)
        ├── app.config.server.ts / app.routes.server.ts   SSR config (all routes prerendered)
        ├── app.routes.ts
        ├── components/            feature components (see above)
        ├── modules/material.module.ts
        └── service/dummy/         DummyJSON API service + models
```

---

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server at `http://localhost:4200/` |
| `npm run build` | Production build (SSR + prerender) into `dist/my-angular-app/` |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests (Karma) |
| `npm run serve:ssr:my-angular-app` | Serve the SSR build with Express |
| `npm run build:ghpages` | Static build (`outputMode: static`) with base href `/arthur-hsiao-portfolio/` |
| `npm run deploy:ghpages` | Static build, then push `dist/my-angular-app/browser` to the `gh-pages` branch |

---

## Build and deployment

- **`ghpages` configuration** (in `angular.json`): static output, so no Node server is needed. Budgets: initial bundle warns at 1 MB and errors at 2 MB; component styles warn at 4 kB and error at 8 kB.
- **CI** ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)): runs on every push to `master` and can also be started manually. It uses Node 20 to run `npm ci` and `npm run build:ghpages`, then uploads `dist/my-angular-app/browser` and deploys it with `actions/deploy-pages`.
- **Base href:** `/arthur-hsiao-portfolio/`. If the repository is renamed or a custom domain is used, update it in the `build:ghpages` script.
