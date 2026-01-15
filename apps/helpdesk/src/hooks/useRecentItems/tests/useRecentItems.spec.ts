import { localForageManager } from '@repo/browser-storage'
import { flushPromises, renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { DEBOUNCE_TIME, RecentItems } from 'hooks/useRecentItems/constants'
import useRecentItems from 'hooks/useRecentItems/useRecentItems'

const mockSetItem = jest.fn().mockResolvedValue(true)
const mockObserveTableUnsubscribe = jest.fn()
const mockObserveTable = jest.fn()

const mockLength = jest.fn()
const mockKeys = jest.fn().mockResolvedValue([])
const mockGetItems = jest.fn()
const mockIterate = jest.fn()
const mockRemoveItem = jest.fn().mockResolvedValue(true)
const mockRemoveItems = jest.fn().mockResolvedValue(true)
const mockGetTableObject = {
    setItem: mockSetItem,
    ready: jest.fn().mockResolvedValue(true),
    getItems: mockGetItems.mockResolvedValue({}),
    iterate: mockIterate.mockResolvedValue(undefined),
    length: mockLength.mockResolvedValue(0),
    keys: mockKeys,
    removeItem: mockRemoveItem,
    removeItems: mockRemoveItems,
} as unknown as LocalForage

const mockDate = 1680109831299

describe('useRecentItems', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        jest.spyOn(localForageManager, 'getTable').mockReturnValue(
            mockGetTableObject,
        )
        jest.spyOn(localForageManager, 'observeTable').mockImplementation(
            mockObserveTable.mockReturnValue({
                unsubscribe: mockObserveTableUnsubscribe,
            }),
        )
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should return loading state', async () => {
        const { result } = renderHook(() => useRecentItems(RecentItems.Tickets))

        expect(result.current).toEqual(
            expect.objectContaining({
                isGettingItems: true,
            }),
        )

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.objectContaining({
                    isGettingItems: false,
                }),
            )
        })
    })

    it('should observe table', async () => {
        const { result } = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => expect(result.current.isGettingItems).toBe(false))

        expect(mockObserveTable).toHaveBeenCalled()
    })

    it('should unsubscribe from table observable', async () => {
        const { result, unmount } = renderHook(() =>
            useRecentItems(RecentItems.Tickets),
        )
        await waitFor(() => expect(result.current.isGettingItems).toBe(false))

        unmount()

        expect(mockObserveTableUnsubscribe).toHaveBeenCalled()
    })

    it('should return no items by default', async () => {
        const { result } = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => expect(result.current.isGettingItems).toBe(false))

        expect(result.current.items).toEqual([])
    })

    it('should return reverse sorted items', async () => {
        mockGetItems.mockResolvedValue({ 0: 'foo', 1: 'bar', 2: 'baz' })

        const { result } = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => expect(result.current.isGettingItems).toBe(false))

        await waitFor(() => {
            expect(result.current.items).toEqual(['baz', 'bar', 'foo'])
        })
    })

    it('should set item', async () => {
        const { result } = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => expect(result.current.isGettingItems).toBe(false))

        await act(async () => {
            jest.useFakeTimers().setSystemTime(mockDate)
            await result.current.setRecentItem({ id: 1 })
            jest.runAllTimers()
            await flushPromises()
        })

        expect(mockSetItem).toHaveBeenCalledWith(
            (mockDate + DEBOUNCE_TIME).toString(),
            {
                id: 1,
            },
        )
    })

    it('should not set item twice if same item is provided', async () => {
        const { result } = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => expect(result.current.isGettingItems).toBe(false))

        await act(async () => {
            jest.useFakeTimers().setSystemTime(mockDate)
            await result.current.setRecentItem({ id: 1 })
            jest.runAllTimers()
            await flushPromises()

            jest.useFakeTimers().setSystemTime(mockDate)
            await result.current.setRecentItem({ id: 1 })
            jest.runAllTimers()
            await flushPromises()
        })

        expect(mockSetItem).toHaveBeenCalledTimes(1)
    })

    it('should set item again if same item is provided, with updated fields', async () => {
        const { result } = renderHook(() =>
            useRecentItems<any>(RecentItems.Tickets),
        )
        await waitFor(() => expect(result.current.isGettingItems).toBe(false))

        await act(async () => {
            jest.useFakeTimers().setSystemTime(mockDate)
            await result.current.setRecentItem({ id: 1 })
            jest.runAllTimers()
            await flushPromises()

            mockLength.mockResolvedValue(1)
            mockIterate.mockResolvedValue(mockDate.toString())
            jest.useFakeTimers().setSystemTime(mockDate)
            await result.current.setRecentItem({ id: 1, foo: 'bar' })
            jest.runAllTimers()
            await flushPromises()
        })

        expect(mockSetItem).toHaveBeenNthCalledWith(2, mockDate.toString(), {
            id: 1,
            foo: 'bar',
        })
    })

    it('should delete item if it already exists and rewrite with a new key', async () => {
        mockLength.mockResolvedValue(1)
        mockKeys.mockResolvedValue([mockDate.toString()])
        mockIterate.mockResolvedValue(mockDate.toString())

        const { result } = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => expect(result.current.isGettingItems).toBe(false))

        await act(async () => {
            jest.useFakeTimers().setSystemTime(mockDate)
            await result.current.setRecentItem({ id: 1 })
            jest.runAllTimers()
            await flushPromises()
        })

        expect(mockRemoveItem).toHaveBeenCalledWith(mockDate.toString())
        expect(mockSetItem).toHaveBeenCalledWith(
            (mockDate + DEBOUNCE_TIME).toString(),
            {
                id: 1,
            },
        )
    })

    it('should delete first item if there are more than maxItems', async () => {
        mockLength.mockResolvedValue(5)
        mockKeys.mockResolvedValue(['0', '1', '2', '3', '4'])

        const { result } = renderHook(() =>
            useRecentItems(RecentItems.Tickets, 5),
        )
        await waitFor(() => expect(result.current.isGettingItems).toBe(false))

        await act(async () => {
            jest.useFakeTimers().setSystemTime(mockDate)
            await result.current.setRecentItem({ id: 1 })
            jest.runAllTimers()
            await flushPromises()
        })

        expect(mockRemoveItems).toHaveBeenCalledWith(['0'])
        expect(mockSetItem).toHaveBeenCalledWith(
            (mockDate + DEBOUNCE_TIME).toString(),
            { id: 1 },
        )
    })
})
