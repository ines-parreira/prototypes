import useLocalStorage from 'hooks/useLocalStorage'

export enum TimeframePreferenceSelection {
    basedOnTicketStatuses = 'based_on_ticket_statuses',
    basedOnTicketCreationDate = 'based_on_ticket_creation_date',
}

export const PREFERENCE_TIMEFRAME_SELECTION_KEY =
    'preference-timeframe-selection'

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
