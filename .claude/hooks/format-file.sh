#!/bin/bash

input=$(cat)

file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

if [ -z "$file_path" ]; then
  exit 0
fi

if [[ "$file_path" =~ \.(ts|tsx|js|jsx|mjs|cjs|json|css|scss|md|mdx|yaml|yml|html)$ ]]; then
  pnpm exec prettier --write "$file_path"
fi

exit 0
