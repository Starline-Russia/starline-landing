import { defineConfig } from "astro/config";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/").at(-1) ?? "Workshop";

export default defineConfig({
  site: isGitHubPages ? "https://yuriypapenov.github.io" : undefined,
  base: isGitHubPages ? `/${repositoryName}` : undefined,
  output: "static",
  build: {
    format: "directory",
  },
});
