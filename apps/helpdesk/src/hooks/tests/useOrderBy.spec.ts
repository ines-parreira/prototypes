import { waitFor } from '@testing-library/react'

import useOrderBy from 'hooks/useOrderBy'
import { OrderDirection } from 'models/api/types'
import { renderHook } from 'utils/testing/renderHook'

describe('useOrderBy', () => {
    it('should return orderBy and orderParam null/undefined when there is no default value', () => {
        const { result } = renderHook(() => useOrderBy())
        expect(result.current.orderBy).toBeUndefined()
        expect(result.current.orderDirection).toBe('asc')
        expect(result.current.orderParam).toBeNull()
    })

    it('should return orderBy and orderParam with default value', () => {
        const { result } = renderHook(() => useOrderBy('name'))
        expect(result.current.orderBy).toBe('name')
        expect(result.current.orderDirection).toBe('asc')
        expect(result.current.orderParam).toBe('name:asc')
    })

    it('should return orderBy and orderParam with default value and default order direction', () => {
        const { result } = renderHook(() =>
            useOrderBy('name', OrderDirection.Desc),
        )
        expect(result.current.orderBy).toBe('name')
        expect(result.current.orderDirection).toBe('desc')
        expect(result.current.orderParam).toBe('name:desc')
    })

    it('should correctly update result when toggleOrderBy is called with same orderBy', async () => {
        const { result } = renderHook(() => useOrderBy<string>('name'))
        result.current.toggleOrderBy('name')

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    orderBy: 'name',
                    orderDirection: 'desc',
                    orderParam: 'name:desc',
                }),
            )
        })
    })

    it('should correctly update result when toggleOrderBy is called with different orderBy', async () => {
        const { result } = renderHook(() => useOrderBy<string>('name'))

        // act(() => {
        result.current.toggleOrderBy('category')
        // })

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    orderBy: 'category',
                    orderDirection: 'asc',
                    orderParam: 'category:asc',
                }),
            )
        })
    })

    it('should correctly update result when toggleOrderBy is called with different orderBy and orderDirection is not default', async () => {
        const { result } = renderHook(() =>
            useOrderBy<string>('name', OrderDirection.Desc),
        )
        result.current.toggleOrderBy('language')

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    orderBy: 'language',
                    orderDirection: 'asc',
                    orderParam: 'language:asc',
                }),
            )
        })
    })
})
