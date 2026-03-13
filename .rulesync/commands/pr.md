---
targets:
  - '*'
---
# /pr - Pull Request Creator

Generate or update pull request content that focuses on **what** changed and **why**, without technical implementation details.

## Instructions

### 1. Determine Mode

- **Create mode**: No PR link/number provided → generate content for new PR
- **Update mode**: PR link or number provided → update existing PR description

### 2. Check for PR Template

Search for templates in order:

1. `.github/PULL_REQUEST_TEMPLATE.md`
2. `.github/pull_request_template.md`

If a template exists, read it and use its structure for the PR body.

### 3. Analyze Changes

**For create mode:**

```bash
git log origin/main..HEAD --oneline
git diff origin/main...HEAD --stat
For update mode:

gh pr view <number> --json commits,files
gh pr diff <number>
```

### 4. Generate Content

Title: Concise summary (50 chars or less when possible). Use imperative mood.

Body:

If template exists: fill in template sections
If no template: write a brief paragraph explaining what changed and why
Content guidelines:

Focus on the user/business impact
Explain the motivation for the change
Do NOT include: file names, function names, technical implementation details, code snippets

### 5. Execute

Create:

```bash
gh pr create --title "..." --body "..."
```

Update:

```bash
gh pr edit <number> --title "..." --body "..."
```
