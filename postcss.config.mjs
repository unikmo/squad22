// Squad22 uses plain CSS (app/globals.css) — no Tailwind.
// This file exists to stop postcss-load-config from walking UP the directory
// tree and picking up the parent folder's config, which declares
// "@tailwindcss/postcss" (a plugin that is not installed here).
const config = {
  plugins: {},
};

export default config;
