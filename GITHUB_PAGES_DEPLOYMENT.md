# Deploying OLED Menu Builder to GitHub Pages

This guide explains how to deploy this OLED Menu Builder web application to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. Node.js and npm installed on your computer

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in.
2. Click on the "+" icon in the top right corner and select "New repository".
3. Name your repository (for example, "oled-menu-builder").
4. Make the repository public.
5. Click "Create repository".

## Step 2: Prepare Your Project for GitHub Pages

1. First, we need to add the GitHub Pages configuration to the project. Open your project's `vite.config.ts` file and modify it to include a base path:

```typescript
// vite.config.ts
export default defineConfig({
  // ... other config
  base: '/oled-menu-builder/', // Use your repository name here
  // ... rest of config
})
```

2. Also add a GitHub Pages deployment script to your `package.json`:

```json
{
  "scripts": {
    // ... other scripts
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Install the required dependency:

```bash
npm install --save-dev gh-pages
```

## Step 3: Build and Deploy

1. Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/oled-menu-builder.git
cd oled-menu-builder
```

2. Copy all the files from this Replit project to your local repository folder.

3. Initialize Git, add files, and make your first commit:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/oled-menu-builder.git
git push -u origin main
```

4. Build and deploy your project:

```bash
npm install
npm run deploy
```

5. This will create a new branch called `gh-pages` with your built project and push it to GitHub.

## Step 4: Configure GitHub Pages in Repository Settings

1. Go to your repository on GitHub.
2. Click on "Settings".
3. Scroll down to the "GitHub Pages" section.
4. For the "Source" option, select the `gh-pages` branch.
5. Click "Save".
6. Wait a few minutes for GitHub to build and deploy your site.
7. Your site will be available at `https://your-username.github.io/oled-menu-builder/`.

## Tips for Successful Deployment

1. Make sure all your asset paths are relative, not absolute.
2. If you're using client-side routing, you might need to add a 404.html file that redirects to your index.html.
3. Update the base URL in your code to ensure all resources load correctly.
4. Keep local storage/session storage usage in mind as data will be specific to each domain.

## Troubleshooting

If you encounter any issues:

1. Check if your repository name matches exactly the base path in vite.config.ts.
2. Ensure all dependencies are installed before building.
3. Verify that the GitHub Pages source is set to the gh-pages branch.
4. Look for any console errors in your deployed application.

## Updating Your Deployed Site

To update your deployed site after making changes:

1. Make your changes locally.
2. Commit them to your repository.
3. Run `npm run deploy` again to update the gh-pages branch.
4. GitHub will automatically update your site with the new content.