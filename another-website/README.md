# Another Website Integration Workspace

Drop the source of the other website here (HTML/CSS/JS or React). This folder is not built directly; we import assets or copy code into React components under `client/src` as we integrate.

Suggested structure:

- html/            # raw HTML files or fragments
- css/             # stylesheets (we'll prefix/scope as needed)
- js/              # plain JS snippets if any
- assets/          # images/fonts/etc.

Notes:

1) Large assets (>50MB) should use Git LFS or external hosting.
2) If the other project uses global CSS, we’ll scope it when integrating to avoid leaking styles across the app.
3) Share screenshots and the target placement; we’ll wire them into dedicated React components and routes.
