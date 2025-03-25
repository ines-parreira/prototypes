import useLocalStorage from 'hooks/useLocalStorage'

export enum TagSelection {
    includeTags = 'include_tags',
    excludeTags = 'exclude_tags',
}

export const TAG_RESULTS_SELECTION_KEY = 'tag-results-selection'

export const useTagResultsSelection = (): [
    TagSelection,
    (value: TagSelection) => void,
] => {
    const defaultSelection = TagSelection.includeTags
    const [selection, setSelection] = useLocalStorage(
        TAG_RESULTS_SELECTION_KEY,
        defaultSelection,
    )

    const value =
        selection === TagSelection.includeTags ||
        selection === TagSelection.excludeTags
            ? selection
            : defaultSelection

    return [value, setSelection]
}
