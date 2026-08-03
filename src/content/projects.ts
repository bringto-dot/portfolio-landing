import shots from "./shots.json";
import type { ProjectSlug } from "./types";

/** One entry per emitted shot, written by `npm run images`. */
type Shot = {
  widths: number[];
  width: number;
  height: number;
  /** Average colour of the render, painted while the file decodes. */
  placeholder: string;
};

export type Project = {
  slug: ProjectSlug;
  /** owner/name on GitHub. */
  repo: string;
  /** The colour the whole page takes while this project is showing. */
  stage: string;
  shot: Shot;
};

const SHOTS = shots as Record<ProjectSlug, Shot>;

/**
 * The six projects, in carousel order, and the only place their structure
 * lives. Every surface that shows a project — the card, the counter, the flip
 * side, the arrows — reads from here, so a seventh project is one entry rather
 * than a seventh copy of a layout that has quietly drifted from the other six.
 *
 * Language belongs in the dictionaries, not here: this file has no prose in it.
 */
export const PROJECTS: readonly Project[] = [
  { slug: "ai-sales", repo: "bringto-dot/ai-sales-landing", stage: "#ffffff", shot: SHOTS["ai-sales"] },
  { slug: "prmpt", repo: "bringto-dot/prmpt-landing", stage: "#0a0a0b", shot: SHOTS.prmpt },
  {
    slug: "japanese-restaurant",
    repo: "bringto-dot/japanese-restaurant-landing",
    stage: "#b4121b",
    shot: SHOTS["japanese-restaurant"],
  },
  {
    slug: "stipula-legal",
    repo: "bringto-dot/stipula-legal-landing",
    stage: "#12315e",
    shot: SHOTS["stipula-legal"],
  },
  { slug: "nimbus-crm", repo: "bringto-dot/nimbus-crm-dashboard", stage: "#f5c518", shot: SHOTS["nimbus-crm"] },
  {
    slug: "productivity-bot",
    repo: "bringto-dot/productivity-tracker-bot",
    stage: "#5ac8fa",
    shot: SHOTS["productivity-bot"],
  },
];

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

/** `srcset` for one project in one format, so phones stop downloading 1472px. */
export const shotSrcSet = (project: Project, format: "avif" | "webp") =>
  project.shot.widths
    .map((width) => `${asset(`projects/${project.slug}-${width}.${format}`)} ${width}w`)
    .join(", ");

/** The `<img src>` fallback: the smallest width, so it is never the big one. */
export const shotFallback = (project: Project) =>
  asset(`projects/${project.slug}-${project.shot.widths[0]}.webp`);

export const repoUrl = (project: Project) => `https://github.com/${project.repo}`;
