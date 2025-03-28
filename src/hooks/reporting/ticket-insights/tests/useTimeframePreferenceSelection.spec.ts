import {
    getTimeframePreferenceSelection,
    TimeframePreferenceSelection,
    useTimeframePreferenceSelection,
} from 'hooks/reporting/ticket-insights/useTimeframePreferenceSelection'
import useLocalStorage from 'hooks/useLocalStorage'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/useLocalStorage')
const useLocalStorageMock = assumeMock(useLocalStorage)

const setSelectionMock = jest.fn()

describe('useTimeframePreferenceSelection', () => {
    it('should return the right default value', () => {
        useLocalStorageMock.mockReturnValue([
            TimeframePreferenceSelection.basedOnTicketStatuses,
            jest.fn(),
            () => {},
        ])

        const [result] = useTimeframePreferenceSelection(true)

        expect(result).toEqual(
            TimeframePreferenceSelection.basedOnTicketStatuses,
        )
    })

    it('should select another value for isTagsReport=true', () => {
        useLocalStorageMock.mockReturnValue([
            TimeframePreferenceSelection.basedOnTicketStatuses,
            setSelectionMock,
            () => {},
        ])

        const [__, setResult] = useTimeframePreferenceSelection(true)

        setResult(TimeframePreferenceSelection.basedOnTicketCreationDate)

        expect(setSelectionMock).toHaveBeenCalledWith(
            TimeframePreferenceSelection.basedOnTicketCreationDate,
        )
    })

    it('should select another value for isTagsReport=false', () => {
        useLocalStorageMock.mockReturnValue([
            TimeframePreferenceSelection.basedOnTicketCreationDate,
            setSelectionMock,
            () => {},
        ])

        const [__, setResult] = useTimeframePreferenceSelection(false)

        setResult(TimeframePreferenceSelection.basedOnTicketStatuses)

        expect(setSelectionMock).toHaveBeenCalledWith(
            TimeframePreferenceSelection.basedOnTicketStatuses,
        )
    })

    it('should return default value if a wrong value is set', () => {
        useLocalStorageMock.mockReturnValue([
            'wrong-value',
            setSelectionMock,
            () => {},
        ])

        const [result] = useTimeframePreferenceSelection(true)

        expect(result).toEqual(
            TimeframePreferenceSelection.basedOnTicketStatuses,
        )
    })
})

describe('getTimeframePreferenceSelection', () => {
    it('should return the right key', () => {
        expect(getTimeframePreferenceSelection(true)).toEqual(
            'tags/preference-timeframe-selection',
        )
        expect(getTimeframePreferenceSelection(false)).toEqual(
            'ticket-fields/preference-timeframe-selection',
        )
    })
})
