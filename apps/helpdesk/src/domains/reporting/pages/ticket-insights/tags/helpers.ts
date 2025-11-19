import {
    TAGS_RESULTS_SELECTION_KEY,
    TagSelection,
} from 'domains/reporting/hooks/tags/useTagResultsSelection'

export const getTagName = ({
    name,
    id,
}: {
    name?: string
    id: string | number
}): string => {
    return name || `${id} (deleted)`
}

export const getTagResultsSelectionFromSessionStorage = (): TagSelection => {
    const selection = window.sessionStorage.getItem(TAGS_RESULTS_SELECTION_KEY)
    if (
        selection === TagSelection.includeTags ||
        selection === TagSelection.excludeTags
    ) {
        return selection
    }

    return TagSelection.includeTags
}
