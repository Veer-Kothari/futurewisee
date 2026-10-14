/** Last-resort page when server rendering itself fails: self-contained, no external assets. */
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load — FutureWise</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <style>
      body { font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; background: #ffffff; color: #172b3a; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 30rem; width: 100%; }
      .brand { font-weight: 700; font-size: 1.5rem; color: #0b3b6e; margin: 0 0 1.5rem; }
      h1 { font-size: 1.25rem; color: #0b3b6e; margin: 0 0 0.5rem; }
      p { color: #3d4d59; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
      a, button { min-height: 44px; padding: 0 1.25rem; display: inline-flex; align-items: center; font: inherit; font-weight: 600; font-size: 0.9rem; cursor: pointer; text-decoration: none; border: 1px solid #0b3b6e; }
      .primary { background: #0b3b6e; color: #fff; }
      .secondary { background: #fff; color: #0b3b6e; }
    </style>
  </head>
  <body>
    <div class="card">
      <p class="brand">FutureWise</p>
      <h1>This page didn't load</h1>
      <p>Something went wrong on our side. Please try again in a moment.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/industry-resources">Industry Insights</a>
      </div>
    </div>
  </body>
</html>`;
}
