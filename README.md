# Arthur Hsiao - Full Stack Developer Portfolio

Demo: https://hsiaoj0629.github.io/arthur-hsiao-portfolio/home

A professional portfolio website showcasing my skills, experience, and projects. Built with Angular 19, Angular Material, and modern web technologies.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.11.

## Features

- **Professional Home Page** with hero section and quick stats
- **About Me** section with professional summary, skills, and work history
- **Interactive Demo** showcasing full-stack development capabilities
- **Contact Page** with email, LinkedIn, and GitHub links
- **Responsive Design** optimized for all devices
- **Server-Side Rendering (SSR)** for better SEO and performance
- **Modern UI/UX** with smooth animations and Material Design

## Important: Update Your Information

Before deploying, make sure to update:

1. **Contact Component** (`src/app/components/contact/contact.component.ts`):
   - Update `linkedInUrl` with your actual LinkedIn profile URL
   - Update `githubUrl` with your actual GitHub profile URL

2. **Personal Information**: Review and update all personal details throughout the application to match your current information.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Deploying to GitHub Pages

This project is configured for deployment to GitHub Pages. There are two methods available:

### Method 1: Automatic Deployment with GitHub Actions (Recommended)

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

2. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **The workflow will automatically:**
   - Build your Angular app for static hosting
   - Deploy it to GitHub Pages
   - Your site will be available at `https://[username].github.io/arthur-hsiao-portfolio/`

**Note:** The workflow triggers on pushes to the `main` branch. If your default branch is `master`, update `.github/workflows/deploy.yml` to use `master` instead.

### Method 2: Manual Deployment

1. **Build for GitHub Pages:**
   ```bash
   npm run build:ghpages
   ```

2. **Deploy using angular-cli-ghpages:**
   ```bash
   npm run deploy:ghpages
   ```

   On first deployment, you may be prompted to authenticate with GitHub.

3. **Configure GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select the `gh-pages` branch and `/ (root)` folder

### Important Notes

- **Base Href:** The app is configured with base href `/arthur-hsiao-portfolio/` for GitHub Pages. If your repository has a different name, update the `--base-href` flag in `package.json` scripts.
- **Custom Domain:** If you're using a custom domain, change the base href to `/` in the build script.
- **SSR:** GitHub Pages only supports static sites, so SSR is disabled for the `ghpages` build configuration.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
