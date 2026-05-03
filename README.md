# Three Great Things Newsletter Editor

Local-only WYSIWYG editor for the Three Great Things email template.

## Run

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build Check

```bash
npm run build
```

## GitHub Pages

This app can be hosted as a static GitHub Pages site. Push the project to a public GitHub repository, then in the repository settings choose Pages and set the source to GitHub Actions. The included workflow builds the app and publishes it from the `dist` folder.

After GitHub finishes deploying, share the Pages URL with a collaborator. They can use the app directly in the browser without downloading or installing anything.

Drafts save automatically in each user’s browser localStorage. Exported HTML is generated as one complete email-safe document plus separate Beehiiv-ready snippets with inline styles and the beehiiv footer placeholders preserved unless edited.
