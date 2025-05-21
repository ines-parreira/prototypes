import * as ReactQuery from '@tanstack/react-query'
import { act } from '@testing-library/react'

import { flushPromises } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import useTicketData from '../useTicketData'

describe('useTicketData', () => {
    let fetchQuery: jest.Mock

    beforeEach(() => {
        fetchQuery = jest.fn().mockResolvedValue([])
        jest.spyOn(ReactQuery, 'useQueryClient').mockReturnValue({
            fetchQuery,
        } as unknown as ReactQuery.QueryClient)
    })

    it('should mark given tickets as read', async () => {
        fetchQuery.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }])
        const { result } = renderHook(() => useTicketData([1, 2, 3], jest.fn()))

        await flushPromises()

        expect(result.current.data).toEqual({
            1: { id: 1 },
            2: { id: 2 },
            3: { id: 3 },
        })

        act(() => {
            result.current.bulkToggleUnread([1, 3], true)
        })

        expect(result.current.data).toEqual({
            1: { id: 1, is_unread: true },
            2: { id: 2 },
            3: { id: 3, is_unread: true },
        })
    })

    it('should mark given tickets as unread', async () => {
        fetchQuery.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }])
        const { result } = renderHook(() => useTicketData([1, 2, 3], jest.fn()))

        await flushPromises()

        expect(result.current.data).toEqual({
            1: { id: 1 },
            2: { id: 2 },
            3: { id: 3 },
        })

        act(() => {
            result.current.bulkToggleUnread([2, 3], false)
        })

        expect(result.current.data).toEqual({
            1: { id: 1 },
            2: { id: 2, is_unread: false },
            3: { id: 3, is_unread: false },
        })
    })

    it('should not modify the state if the tickets being marked have no data', async () => {
        fetchQuery.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }])
        const { result } = renderHook(() => useTicketData([1, 2, 3], jest.fn()))

        await flushPromises()

        expect(result.current.data).toEqual({
            1: { id: 1 },
            2: { id: 2 },
            3: { id: 3 },
        })

        act(() => {
            result.current.bulkToggleUnread([4], false)
        })

        expect(result.current.data).toEqual({
            1: { id: 1 },
            2: { id: 2 },
            3: { id: 3 },
        })
    })
})
