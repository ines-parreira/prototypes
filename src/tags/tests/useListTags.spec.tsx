import {renderHook} from '@testing-library/react-hooks'
import {useListTags as useListTagsQuery} from '@gorgias/api-queries'

import {tags} from 'fixtures/tag'
import {handleError} from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'
import {assumeMock} from 'utils/testing'

import useListTags from '../useListTags'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)
const dispatchMock = jest.fn()
useAppDispatchMock.mockReturnValue(dispatchMock)

jest.mock('hooks/agents/errorHandler')
const handleErrorMock = assumeMock(handleError)

jest.mock('@gorgias/api-queries')
const mockUseListTags = useListTagsQuery as jest.Mock

describe('useListTags', () => {
    it('should call useListTags with proper params and return the data and loading status', () => {
        const search = 'refund'
        const params = {search}
        const query = {
            staleTime: 10000,
            enabled: true,
        }
        mockUseListTags.mockReturnValueOnce({
            data: tags,
            isLoading: false,
            error: undefined,
        } as ReturnType<typeof useListTagsQuery>)
        const {result} = renderHook(() => useListTags(params, query))

        expect(mockUseListTags).toHaveBeenCalledWith(
            expect.objectContaining({
                search,
            }),
            expect.objectContaining({
                query,
            })
        )
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBe(tags)
    })

    it('should call handleError when useListTags returns an error', () => {
        const errorMsgMock = 'errorMsgMock'
        mockUseListTags.mockImplementationOnce(
            () =>
                ({
                    data: undefined,
                    isLoading: false,
                    error: {
                        response: errorMsgMock,
                    },
                } as ReturnType<typeof useListTagsQuery>)
        )
        const {result} = renderHook(() => useListTags())

        expect(handleErrorMock).toHaveBeenCalledWith(
            expect.objectContaining({
                response: errorMsgMock,
            }),
            expect.any(String),
            dispatchMock
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBe(undefined)
    })
})
