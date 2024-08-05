import {renderHook} from '@testing-library/react-hooks'
import {useListTags} from '@gorgias/api-queries'

import {tags} from 'fixtures/tag'
import {handleError} from 'hooks/agents/errorHandler'
import {StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

import useGetTags from '../useGetTags'

jest.mock('hooks/agents/errorHandler')
const handleErrorMock = assumeMock(handleError)

jest.mock('@gorgias/api-queries')
const mockUseListTags = useListTags as jest.Mock

describe('useGetTags', () => {
    const dispatch = jest.fn((fn: () => unknown) =>
        fn()
    ) as unknown as StoreDispatch

    const search = 'refund'
    const params = [dispatch, {search}] as const

    it('should call useListTags with proper params and return the data and loading status', () => {
        mockUseListTags.mockReturnValueOnce({
            data: tags,
            isLoading: false,
            error: undefined,
        } as ReturnType<typeof useListTags>)
        const {result} = renderHook(() => useGetTags(...params))

        expect(mockUseListTags).toHaveBeenCalledWith(
            expect.objectContaining({
                search,
            }),
            expect.any(Object)
        )
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBe(tags)
    })

    it('should call handleError when useListTags returns an error', () => {
        mockUseListTags.mockImplementationOnce(
            () =>
                ({
                    data: undefined,
                    isLoading: false,
                    error: true,
                } as ReturnType<typeof useListTags>)
        )
        const {result} = renderHook(() => useGetTags(...params))

        expect(handleErrorMock).toHaveBeenCalledTimes(1)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBe(undefined)
    })
})
