import { waitFor } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import useLocalStorage from 'hooks/useLocalStorage'
import {
    TagSelection,
    useTagResultsSelection,
} from 'hooks/useTagResultsSelection'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/useLocalStorage')
const useLocalStorageMock = assumeMock(useLocalStorage)
jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

const setSelectionMock = jest.fn()
const dispatchMock = jest.fn()

describe('useTagResultsSelection', () => {
    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

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
        useLocalStorageMock.mockReturnValue([TagSelection.excludeTags] as any)

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
        ] as any)

        const [__, setResult] = useTagResultsSelection()

        setResult(TagSelection.excludeTags)

        expect(setSelectionMock).toHaveBeenCalledWith(TagSelection.excludeTags)
        waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: TagSelection.excludeTags,
                }),
            )
        })

        setResult(TagSelection.includeTags)

        expect(setSelectionMock).toHaveBeenCalledWith(TagSelection.includeTags)
        waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: TagSelection.includeTags,
                }),
            )
        })
    })
})
