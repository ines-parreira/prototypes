import { act } from '@testing-library/react'

import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

import useLocalStorage from 'hooks/useLocalStorage'
import { renderHook } from 'utils/testing/renderHook'

import useSortOrder from '../useSortOrder'

jest.mock('hooks/useLocalStorage', () => jest.fn())
const useLocalStorageMock = useLocalStorage as jest.Mock

describe('useSortOrder', () => {
    beforeEach(() => {
        useLocalStorageMock.mockReturnValue([{}, jest.fn()])
    })

    it('should return the given sort order if it is supported', () => {
        const { result } = renderHook(() =>
            useSortOrder(1, 'created_datetime:desc'),
        )
        expect(result.current).toEqual([
            'created_datetime:desc',
            expect.any(Function),
        ])
    })

    it('should return the default sort order if the given order is not supported', () => {
        const { result } = renderHook(() =>
            useSortOrder(
                1,
                'snoozed_datetime:desc' as ListViewItemsUpdatesOrderBy,
            ),
        )
        expect(result.current).toEqual([
            'last_message_datetime:asc',
            expect.any(Function),
        ])
    })

    it('should update the sort order if a new order is given', () => {
        const { rerender, result } = renderHook(
            (sortOrder: ListViewItemsUpdatesOrderBy) =>
                useSortOrder(1, sortOrder),
            { initialProps: 'last_message_datetime:asc' },
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

    it('should return the persisted sort order if one is defined', () => {
        useLocalStorageMock.mockReturnValue([
            { '1': 'last_received_message_datetime:asc' },
            jest.fn(),
        ])

        const { result } = renderHook(() =>
            useSortOrder(1, 'last_received_message_datetime:asc'),
        )
        expect(result.current).toEqual([
            'last_received_message_datetime:asc',
            expect.any(Function),
        ])
    })

    it('should persist the new sort order when set', () => {
        const persist = jest.fn()
        useLocalStorageMock.mockReturnValue([{}, persist])

        const { result } = renderHook(() =>
            useSortOrder(1, 'last_message_datetime:asc'),
        )

        act(() => {
            result.current[1]('last_message_datetime:asc')
        })

        expect(persist).toHaveBeenCalledWith({ 1: 'last_message_datetime:asc' })
    })
})
