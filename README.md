# Rover website

The SvelteKit website for [roverhq.ai](https://roverhq.ai/).

## Development

```sh
npm ci
npm run dev
```

## Validation and production build

```sh
npm run check
npm run build
npm run preview
```

The static adapter writes the compiled site to `build/`.

## Deployment

In this repository's **Settings → Pages → Build and deployment**, keep **Source**
set to **GitHub Actions**. Keep the custom domain set to `roverhq.ai`.

The [deployment workflow](.github/workflows/deploy.yml) runs on pushes to `main`,
compiles the app, and publishes only `build/`. It first checks that Pages uses
GitHub Actions and fails with instructions if the setting has changed.

Do not select **Deploy from a branch**. The repository root contains source code,
not the compiled site. Branch publishing runs Jekyll, which can publish this README
and overwrite the Svelte deployment.

For a manual redeploy, open **Actions → Deploy to GitHub Pages → Run workflow**
and select `main`. Verify the homepage and `/blogs/` after deployment completes.

If the source setting is accidentally changed, restore **GitHub Actions**, let any
already-running Jekyll deployment finish or cancel it, then rerun the Svelte
workflow. The workflow check detects this configuration error; it does not stop a
separate Jekyll deployment or change repository settings automatically.

## Comparison PDF forms

Comparison pages share a Google Apps Script backend that saves leads in a private
Google Sheet and emails the Workspace account that owns the script. The site stays
on GitHub Pages. See [the setup guide](integrations/google-leads/README.md).

```sh
npm run setup:google-leads
npm run test:leads
```

The setup command creates a local guide with a button to copy the complete backend.
After deploying it, set the public `/exec` URL in
`src/lib/config/lead-capture.ts`. Until that URL is configured, the PDF form is
disabled and does not collect or submit visitors' details.
