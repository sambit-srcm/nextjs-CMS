/** Commit message rules. Sentence-case subjects are allowed. A body is required. */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [2, "never", ["lower-case", "snake-case"]],
    "body-empty": [2, "never"],
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
