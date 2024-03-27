# Get the commit hash of the most recent common commit between the source and target branches
COMMON_ANCESTOR_COMMIT=$(git merge-base $SOURCE_BRANCH $TARGET_BRANCH)

echo "Comparing commit hash $SOURCE_BRANCH with common ancestor commit hash $COMMON_ANCESTOR_COMMIT"

# Get the list of added snapshot files in the current merge request
NEW_SNAP_FILES=$(git diff --name-only --diff-filter=A $COMMON_ANCESTOR_COMMIT $SOURCE_BRANCH -- "*.snap")

# Check if any new .snap files were found
if [[ -n "$NEW_SNAP_FILES" && ! "$SOURCE_BRANCH_NAME" =~ revert ]]; then
    echo "Error: New .snap file(s) found in the merge request:" 1>&2;
    for SNAP_FILE in "${NEW_SNAP_FILES[@]}"; do
        echo "  - $SNAP_FILE" 1>&2;
    done
    exit 1
else
    echo "No new .snap files found in the merge request or branch is a revert"
fi
