# Frontend

Angular application foundation, built with [Angular CLI](https://angular.dev/tools/cli) `22.1.8`, standalone components, TypeScript, and SCSS.

## Requirements

- Node.js `^22.22.3 || ^24.15.0 || >=26.0.0`
- npm `>= 8`

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server (defaults to `http://localhost:4200`):

```bash
npm start
```

## Available scripts

| Command         | Description                                              |
| --------------- | --------------------------------------------------------- |
| `npm start`     | Runs `ng serve` for local development with live reload.   |
| `npm run build` | Production build, output to `dist/frontend`.               |
| `npm run watch` | Development build that rebuilds on file changes.          |
| `npm test`      | Runs unit tests once with Vitest.                          |
| `npm run lint`  | Runs ESLint against `.ts` and `.html` files.               |

## Project structure

```
src/
  app/
    core/            # Singleton services, guards, interceptors, and models used app-wide
      services/
      guards/
      interceptors/
      models/
    shared/          # Reusable, presentation-only building blocks used across features
      components/
      directives/
      pipes/
      models/
    layout/          # Application shell (header, footer, etc.)
      header/
      footer/
    features/        # Feature areas, one folder per route/domain
      home/
      not-found/
    app.ts           # Root standalone component (renders the app shell)
    app.routes.ts    # Route configuration
    app.config.ts    # Application-wide providers (router, error listeners, etc.)
  environments/
    environment.ts               # Production environment values
    environment.development.ts   # Development environment values
  styles/
    _variables.scss  # Design tokens (CSS custom properties)
    _reset.scss       # Minimal CSS reset
  styles.scss        # Global stylesheet entry point
```

Guidelines for extending this structure:

- **`core/`** — anything provided once at the application root (auth service, HTTP interceptors, route guards, shared domain models).
- **`shared/`** — dumb/reusable components, directives, and pipes with no feature-specific logic, consumed by multiple features.
- **`features/`** — one folder per business feature/route area; feature-specific components, services, and models live inside their own feature folder.
- **`layout/`** — components that make up the application shell, as opposed to routed page content.

## Environments

Environment-specific values live in `src/environments/`. `angular.json` swaps `environment.ts` for `environment.development.ts` when building/serving with the `development` configuration (the default for `ng serve`), and uses `environment.ts` as-is for production builds. Import values in code via:

```ts
import { environment } from '../environments/environment';
```

## Linting & formatting

ESLint (via [angular-eslint](https://github.com/angular-eslint/angular-eslint)) and Prettier are configured. Run `npm run lint` to check the codebase; Prettier settings live in `.prettierrc`.

## Building for production

```bash
npm run build
```

Build artifacts are written to `dist/frontend/` and are ready to deploy to any static file host.
