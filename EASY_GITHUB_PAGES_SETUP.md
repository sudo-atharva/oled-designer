# Super Easy GitHub Pages Setup - Just 3 Steps!

Follow these simple steps to get your OLED Menu Builder working on GitHub Pages with minimal effort.

## Step 1: Create a GitHub repository and upload files

1. Go to [GitHub](https://github.com/) and sign in
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "oled-menu-builder")
4. Make it public
5. Click "Create repository"
6. On your new repository page, click on "uploading an existing file"
7. Drag and drop all the downloaded files to the uploader
8. Add a commit message like "Initial upload"
9. Click "Commit changes"

## Step 2: Create a special file for GitHub Pages

1. In your repository, click "Add file" → "Create new file"
2. Name the file `deploy.yml` and place it in this path: `.github/workflows/deploy.yml`
   (You'll need to type this full path including the folders: `.github/workflows/deploy.yml`)
3. Paste the following content into the file:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "18"
      - name: Install dependencies
        run: npm ci
      - name: Build with relative paths
        run: |
          # Temporarily modify vite.config.ts to use relative paths
          echo "Configuring for relative paths..."
          TEMP_CONFIG=$(cat vite.config.ts)
          echo "$TEMP_CONFIG" | sed 's/export default defineConfig({/export default defineConfig({\n  base: ".\/",/' > vite.config.ts.new
          mv vite.config.ts.new vite.config.ts
          npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist/public'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. Click "Commit new file"

## Step 3: Enable GitHub Pages

1. In your repository, go to "Settings"
2. Scroll down to "Pages" in the left sidebar
3. Under "Build and deployment" → "Source", select "GitHub Actions"
4. Wait for the workflow to complete (check the "Actions" tab for progress)
5. Once done, your app will be available at: `https://your-username.github.io/your-repository-name/`

That's it! The workflow will build your application with the correct settings for GitHub Pages automatically.

## Troubleshooting

If you see any issues:

1. Check the "Actions" tab in your repository to see if the workflow completed successfully
2. If there are errors, they will be shown in the workflow logs
3. Make sure all files were uploaded correctly, including the package.json file