import { defineConfig } from "astro/config";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";

export default defineConfig({
  site: isGitHubPages ? "https://yuriypapenov.github.io" : undefined,
  base: isGitHubPages ? "/Workshop" : undefined,
  output: "static",
  build: {
    format: "directory",
  },
});
