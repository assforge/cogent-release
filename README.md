# @assforge/cogent-release

Unified release board for the cogent family. One scan of the sibling
checkouts, plus an AI review gate so self-merge is not a skipped review.

```sh
cogent-release board
cogent-release board --json
cogent-release gate --receipt review.md --sha <commit>
```

`--root` defaults to the parent of this package (`assforge/`). `family.json`
lists the packages. Changesets presence and pending files are first-class.

## AI self-merge

Same GitHub user may merge. Approval is not optional and is not the
author engine:

```
---
subject: assforge/agent-sandbox
sha: <commit>
author_engine: grok
reviewer_engine: deepseek
verdict: APPROVE
---
```

`reviewer_engine` must differ from `author_engine`. `verdict` must be
`APPROVE`. Pass `--sha` to pin the commit.

## Release

This package itself uses changesets (`npm run changeset` / `version` /
`release`) to GitHub Packages, restricted.
