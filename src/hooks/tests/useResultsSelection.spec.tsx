import useLocalStorage from 'hooks/useLocalStorage'
import {
    getTimeframePreferenceSelection,
    TagSelection,
    TimeframePreferenceSelection,
    useTagResultsSelection,
    useTimeframePreferenceSelection,
} from 'hooks/useResultsSelection'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/useLocalStorage')
const useLocalStorageMock = assumeMock(useLocalStorage)

const setSelectionMock = jest.fn()

describe('useResultsSelection', () => {
    describe('useTagResultsSelection', () => {
        it('should return include_tags by default', () => {
            useLocalStorageMock.mockReturnValue([
                TagSelection.includeTags,
                jest.fn(),
            ] as any)

            const [result] = useTagResultsSelection()

            expect(result).toBe(TagSelection.includeTags)
        })

        it('should return include_tags by default', () => {
            useLocalStorageMock.mockReturnValue(['another-value'] as any)

            const [result] = useTagResultsSelection()

            expect(result).toBe(TagSelection.includeTags)
        })

        it('should return exclude_tags', () => {
            useLocalStorageMock.mockReturnValue([
                TagSelection.excludeTags,
            ] as any)

            const [result] = useTagResultsSelection()

            expect(result).toBe(TagSelection.excludeTags)
        })

        it('should return default value if session storage is empty', () => {
            useLocalStorageMock.mockReturnValue([null] as any)

            const [result] = useTagResultsSelection()

            expect(result).toBe(TagSelection.includeTags)
        })

        it('should call setSelection on change', () => {
            useLocalStorageMock.mockReturnValue([
                TagSelection.includeTags,
                setSelectionMock,
                () => {},
            ])

            const [__, setResult] = useTagResultsSelection()

            setResult(TagSelection.excludeTags)

            expect(setSelectionMock).toHaveBeenCalledWith(
                TagSelection.excludeTags,
            )

            setResult(TagSelection.includeTags)

            expect(setSelectionMock).toHaveBeenCalledWith(
                TagSelection.includeTags,
            )
        })
    })

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
})
