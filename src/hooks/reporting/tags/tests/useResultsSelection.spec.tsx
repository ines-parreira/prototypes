import { act, renderHook } from '@testing-library/react-hooks'

import { logEvent, SegmentEvent } from 'common/segment'
import {
    TagSelection,
    useTagResultsSelection,
} from 'hooks/reporting/tags/useTagResultsSelection'
import useLocalStorage from 'hooks/useLocalStorage'
import { assumeMock } from 'utils/testing'

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

jest.mock('hooks/useLocalStorage')
const useLocalStorageMock = assumeMock(useLocalStorage)

const setSelectionMock = jest.fn()

describe('useTagResultsSelection', () => {
    it('should return include_tags by default', () => {
        useLocalStorageMock.mockReturnValue([
            TagSelection.includeTags,
            jest.fn(),
        ] as any)

        const { result } = renderHook(() => useTagResultsSelection())

        expect(result.current[0]).toBe(TagSelection.includeTags)
    })

    it('should return include_tags by default', () => {
        useLocalStorageMock.mockReturnValue(['another-value'] as any)

        const { result } = renderHook(() => useTagResultsSelection())

        expect(result.current[0]).toBe(TagSelection.includeTags)
    })

    it('should return exclude_tags', () => {
        useLocalStorageMock.mockReturnValue([TagSelection.excludeTags] as any)

        const { result } = renderHook(() => useTagResultsSelection())

        expect(result.current[0]).toBe(TagSelection.excludeTags)
    })

    it('should return default value if session storage is empty', () => {
        useLocalStorageMock.mockReturnValue([null] as any)

        const { result } = renderHook(() => useTagResultsSelection())

        expect(result.current[0]).toBe(TagSelection.includeTags)
    })

    it('should call setSelection on change', () => {
        useLocalStorageMock.mockReturnValue([
            TagSelection.includeTags,
            setSelectionMock,
            () => {},
        ])

        const { result } = renderHook(() => useTagResultsSelection())
        const [__, setResult] = result.current

        setResult(TagSelection.excludeTags)

        expect(setSelectionMock).toHaveBeenCalledWith(TagSelection.excludeTags)

        setResult(TagSelection.includeTags)

        expect(setSelectionMock).toHaveBeenCalledWith(TagSelection.includeTags)
    })

    it('should log event when results selection changes', () => {
        const { result } = renderHook(() => useTagResultsSelection())
        const [, setter] = result.current

        act(() => {
            setter(TagSelection.excludeTags)
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.StatTagsExcludeRelatedClicked,
        )
    })
})
