import { useCallback } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'

export enum TagSelection {
    includeTags = 'include_tags',
    excludeTags = 'exclude_tags',
}

export const TAGS_RESULTS_SELECTION_KEY = 'tag-results-selection'

const tagSelectionToEvent: Record<TagSelection, SegmentEvent> = {
    [TagSelection.includeTags]: SegmentEvent.StatTagsIncludeRelatedClicked,
    [TagSelection.excludeTags]: SegmentEvent.StatTagsExcludeRelatedClicked,
}

export const useTagResultsSelection = () => {
    const defaultSelection = TagSelection.includeTags
    const [selection, setSelection] = useLocalStorage(
        TAGS_RESULTS_SELECTION_KEY,
        defaultSelection,
    )

    const value =
        selection === TagSelection.includeTags ||
        selection === TagSelection.excludeTags
            ? selection
            : defaultSelection

    const handleSelectionChange = useCallback(
        (value: TagSelection) => {
            setSelection(value)
            logEvent(tagSelectionToEvent[value])
        },
        [setSelection],
    )

    return [value, handleSelectionChange] as const
}
