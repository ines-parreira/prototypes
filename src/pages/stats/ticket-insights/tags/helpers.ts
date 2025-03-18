import useSessionStorage from 'hooks/useSessionStorage'
import { TagSelection } from 'pages/stats/ticket-insights/tags/TagActionsMenu'

export const getTagName = ({
    name,
    id,
}: {
    name?: string
    id: string
}): string => {
    return name || `${id} (deleted)`
}

const TAG_RESULTS_SELECTION_KEY = 'tag-results-selection'

export const useTagResultsSelection = (): TagSelection => {
    const defaultSelection = TagSelection.includeTags
    const [selectedOption] = useSessionStorage<string>(
        TAG_RESULTS_SELECTION_KEY,
        JSON.stringify(defaultSelection),
        true,
    )

    if (
        selectedOption === TagSelection.includeTags ||
        selectedOption === TagSelection.excludeTags
    ) {
        return selectedOption
    }

    return defaultSelection
}
