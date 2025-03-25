import {
    TAG_RESULTS_SELECTION_KEY,
    TagSelection,
} from 'hooks/useTagResultsSelection'

export const getTagName = ({
    name,
    id,
}: {
    name?: string
    id: string
}): string => {
    return name || `${id} (deleted)`
}

export const getTagResultsSelectionFromSessionStorage = (): TagSelection => {
    const selection = window.sessionStorage.getItem(TAG_RESULTS_SELECTION_KEY)
    if (
        selection === TagSelection.includeTags ||
        selection === TagSelection.excludeTags
    ) {
        return selection
    }

    return TagSelection.includeTags
}
