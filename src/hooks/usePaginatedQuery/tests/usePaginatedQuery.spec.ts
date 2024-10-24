import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {AxiosResponse} from 'axios'

import {useSearchParam} from 'hooks/useSearchParam'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {assumeMock} from 'utils/testing'

import {usePaginatedQuery} from '../usePaginatedQuery'
import {useResponseCursor} from '../useResponseCursor'

jest.mock('hooks/useSearchParam')
const mockedUseSearchParam = assumeMock(useSearchParam)

jest.mock('../useResponseCursor')
const mockedUseResponseCursor = assumeMock(useResponseCursor)

describe('useSearchParams hook', () => {
    const currentCursor = '20-1rpz-magle'
    const previousCursor = '19-1rpz-magle'
    const nextCursor = '21-1rpz-magle'
    const mockedSetCursor = jest.fn()
    const mockedQuery = jest.fn(
        (__arg1: unknown, __arg2: unknown) =>
            ({
                data: {},
                isFetching: false,
            }) as UseQueryResult<
                AxiosResponse<ApiListResponseCursorPagination<any>>,
                unknown
            >
    )
    beforeEach(() => {
        mockedUseSearchParam.mockReturnValue([currentCursor, mockedSetCursor])
        mockedUseResponseCursor.mockReturnValue({
            previousCursor,
            nextCursor,
            isCursorInvalid: false,
        })
    })

    it('should provide utils to handle pagination and return query results', () => {
        const hook = renderHook(() => usePaginatedQuery(mockedQuery))

        hook.result.current.fetchPreviousPage()
        expect(mockedSetCursor).toHaveBeenNthCalledWith(1, previousCursor)

        hook.result.current.fetchNextPage()
        expect(mockedSetCursor).toHaveBeenNthCalledWith(2, nextCursor)

        expect(hook.result.current.hasPreviousPage).toBe(true)
        expect(hook.result.current.hasNextPage).toBe(true)
        expect(hook.result.current.isFetching).toBe(false)
    })

    it('should provide query with given params, a cursor, and overrides', () => {
        const params = {foo: 'bar'}
        const overrides = {enabled: false, someParam: 'someValue'}
        renderHook(() => usePaginatedQuery(mockedQuery, params, overrides))

        expect(mockedQuery).toHaveBeenCalledWith(
            {...params, cursor: currentCursor},
            overrides
        )
    })

    it('should clear cursor if cursor is invalid or if on first page', () => {
        mockedUseResponseCursor.mockReturnValue({
            previousCursor,
            nextCursor,
            isCursorInvalid: true,
        })
        renderHook(() => usePaginatedQuery(mockedQuery))
        expect(mockedSetCursor).toHaveBeenNthCalledWith(1, null)

        mockedUseResponseCursor.mockReturnValue({
            previousCursor: '',
            nextCursor,
            isCursorInvalid: false,
        })
        renderHook(() => usePaginatedQuery(mockedQuery))
        expect(mockedSetCursor).toHaveBeenNthCalledWith(2, null)
    })

    it('should disable query if a previous cursor is set and no current cursor', () => {
        const {rerender} = renderHook(() => usePaginatedQuery(mockedQuery))

        mockedUseSearchParam.mockReturnValue([null, mockedSetCursor])
        rerender()

        expect(mockedQuery).toHaveBeenLastCalledWith(
            {cursor: null},
            {enabled: false}
        )
    })
})
