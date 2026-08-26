/**
 * Commit message rules, matching the convention this repo already follows.
 *
 * Two deliberate departures from @commitlint/config-conventional:
 *
 * 1. `subject-case` — the shipped config forbids sentence-case subjects.
 *    Every commit in this repo uses one ("feat: Add search to the blog
 *    listing"), so the default would reject the house style. Only lower-case
 *    and snake-case are disallowed here, which still rules out the two shapes
 *    that read as accidents.
 *
 * 2. `body-empty` and `footer-empty` are errors rather than unset. A subject
 *    says what changed; the body is where the reason lives, and the footer is
 *    what ties a commit to the work it belongs to.
 */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [2, "never", ["lower-case", "snake-case"]],
    "body-empty": [2, "never"],
    "footer-empty": [2, "never"],
    "body-max-line-length": [2, "always", 72],
    "header-max-length": [2, "always", 72],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
        "release",
      ],
    ],
  },
};

export default config;
