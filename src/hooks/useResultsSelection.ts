import useLocalStorage from 'hooks/useLocalStorage'

export enum TagSelection {
    includeTags = 'include_tags',
    excludeTags = 'exclude_tags',
}

export enum TimeframePreferenceSelection {
    basedOnTicketStatuses = 'based_on_ticket_statuses',
    basedOnTicketCreationDate = 'based_on_ticket_creation_date',
}

export const TAGS_RESULTS_SELECTION_KEY = 'tag-results-selection'
export const PREFERENCE_TIMEFRAME_SELECTION_KEY =
    'preference-timeframe-selection'

export const useTagResultsSelection = (): [
    TagSelection,
    (value: TagSelection) => void,
] => {
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

    return [value, setSelection]
}

export const getTimeframePreferenceSelection = (
    isTagsReport: boolean,
): string => {
    return `${isTagsReport ? 'tags' : 'ticket-fields'}/${PREFERENCE_TIMEFRAME_SELECTION_KEY}`
}

export const useTimeframePreferenceSelection = (
    isTagsReport: boolean,
): [
    TimeframePreferenceSelection,
    (value: TimeframePreferenceSelection) => void,
] => {
    const key = getTimeframePreferenceSelection(isTagsReport)
    const defaultSelection = TimeframePreferenceSelection.basedOnTicketStatuses
    const [selection, setSelection] = useLocalStorage(key, defaultSelection)

    const value =
        selection === TimeframePreferenceSelection.basedOnTicketStatuses ||
        selection === TimeframePreferenceSelection.basedOnTicketCreationDate
            ? selection
            : defaultSelection

    return [value, setSelection]
}
