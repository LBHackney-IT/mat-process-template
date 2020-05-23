export enum Slug {
  Index = "",
  Loading = "loading",
  Sections = "sections",
  Review = "review",
  ManagerReview = "manager-review",
  ClosedReview = "closed-review",
  Submit = "submit",
  Confirmed = "confirmed",
  Pause = "pause",
  Paused = "paused",
}

// `true` if it's a "step" and is rendered by `[...slug]`. `false` if it's an
// explicit page in `pages/`.
const allSlugs: {
  [slug in Slug]: boolean;
} = {
  "": false,
  loading: false,
  sections: false,
  review: false,
  "manager-review": false,
  "closed-review": false,
  submit: false,
  confirmed: false,
  pause: false,
  paused: false,
};

export const stepSlugs = Object.entries(allSlugs)
  .filter(([, include]) => include)
  .reduce((s, [slug]) => [...s, slug as Slug], [] as Slug[]);
export const repeatingStepSlugs: Slug[] = [];
export const unpauseableStepSlugs: Slug[] = [];
