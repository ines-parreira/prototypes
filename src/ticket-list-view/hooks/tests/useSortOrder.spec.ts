import {act, renderHook} from '@testing-library/react-hooks'

import useSortOrder from '../useSortOrder'

describe('useSortOrder', () => {
    it('should return the given sort order if it is supported', () => {
        const {result} = renderHook(() => useSortOrder('created_datetime:desc'))
        expect(result.current).toEqual([
            'created_datetime:desc',
            expect.any(Function),
        ])
    })

    it('should return the default sort order if the given order is not supported', () => {
        const {result} = renderHook(() => useSortOrder('snoozed_datetime:desc'))
        expect(result.current).toEqual([
            'last_message_datetime:asc',
            expect.any(Function),
        ])
    })

    it('should update the sort order if a new order is given', () => {
        const {rerender, result} = renderHook(
            (sortOrder: string) => useSortOrder(sortOrder),
            {initialProps: ''}
        )

        expect(result.current).toEqual([
            'last_message_datetime:asc',
            expect.any(Function),
        ])

        act(() => {
            rerender('created_datetime:desc')
        })

        expect(result.current).toEqual([
            'created_datetime:desc',
            expect.any(Function),
        ])
    })

    it('should set a new sort order', () => {
        const {result} = renderHook(() => useSortOrder(''))
        expect(result.current).toEqual([
            'last_message_datetime:asc',
            expect.any(Function),
        ])

        act(() => {
            result.current[1]('created_datetime:desc')
        })

        expect(result.current).toEqual([
            'created_datetime:desc',
            expect.any(Function),
        ])
    })
})
