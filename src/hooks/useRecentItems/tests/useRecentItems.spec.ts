import {renderHook, act} from '@testing-library/react-hooks/dom'
import {waitFor} from '@testing-library/react'
import _noop from 'lodash/noop'
import LD from 'launchdarkly-react-client-sdk'

import useRecentItems from 'hooks/useRecentItems/useRecentItems'
import {DEBOUNCE_TIME, RecentItems} from 'hooks/useRecentItems/constants'
import LocalForageManager from 'services/localForageManager/localForageManager'
import {flushPromises} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'

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
        jest.spyOn(LocalForageManager, 'getTable').mockReturnValue(
            mockGetTableObject
        )
        jest.spyOn(LocalForageManager, 'observeTable').mockImplementation(
            mockObserveTable.mockReturnValue({
                unsubscribe: mockObserveTableUnsubscribe,
            })
        )
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.SpotlightRecentItems]: true,
        }))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should return dummy values if feature flag is disabled', async () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.SpotlightRecentItems]: false,
        }))

        const {result} = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => result.current)
        expect(result.current).toEqual({
            items: [],
            isGettingItems: false,
            setRecentItem: _noop,
        })
    })

    it('should return loading state', async () => {
        const {result} = renderHook(() => useRecentItems(RecentItems.Tickets))

        expect(result.current).toEqual(
            expect.objectContaining({
                isGettingItems: true,
            })
        )

        await waitFor(() => result.current)

        expect(result.current).toEqual(
            expect.objectContaining({
                isGettingItems: false,
            })
        )
    })

    it('should observe table', async () => {
        const {result} = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => result.current)

        expect(mockObserveTable).toHaveBeenCalled()
    })

    it('should unsubscribe from table observable', async () => {
        const {result, unmount} = renderHook(() =>
            useRecentItems(RecentItems.Tickets)
        )
        await waitFor(() => result.current)

        unmount()

        expect(mockObserveTableUnsubscribe).toHaveBeenCalled()
    })

    it('should return no items by default', async () => {
        const {result} = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => result.current)

        expect(result.current.items).toEqual([])
    })

    it('should return reverse sorted items', async () => {
        mockGetItems.mockResolvedValue({0: 'foo', 1: 'bar', 2: 'baz'})

        const {result} = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => result.current)

        expect(result.current.items).toEqual(['baz', 'bar', 'foo'])
    })

    it('should set item', async () => {
        jest.useFakeTimers().setSystemTime(mockDate)

        const {result} = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => result.current)

        await act(async () => {
            await result.current.setRecentItem({id: 1})
            jest.runAllTimers()
            await flushPromises()
        })

        expect(mockSetItem).toHaveBeenCalledWith(
            (mockDate + DEBOUNCE_TIME).toString(),
            {
                id: 1,
            }
        )
    })

    it('should not set item twice if same item is provided', async () => {
        jest.useFakeTimers().setSystemTime(mockDate)

        const {result} = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => result.current)

        await act(async () => {
            await result.current.setRecentItem({id: 1})
            jest.runAllTimers()
            await flushPromises()
            await result.current.setRecentItem({id: 1})
            jest.runAllTimers()
            await flushPromises()
        })

        expect(mockSetItem).toHaveBeenCalledTimes(1)
    })

    it('should set item again if same item is provided, with updated fields', async () => {
        jest.useFakeTimers().setSystemTime(mockDate)

        const {result} = renderHook(() =>
            useRecentItems<any>(RecentItems.Tickets)
        )
        await waitFor(() => result.current)

        await act(async () => {
            await result.current.setRecentItem({id: 1})
            jest.runAllTimers()
            await flushPromises()
            mockLength.mockResolvedValue(1)
            mockIterate.mockResolvedValue(mockDate.toString())
            await result.current.setRecentItem({id: 1, foo: 'bar'})
            jest.runAllTimers()
            await flushPromises()
        })

        expect(mockSetItem).toHaveBeenNthCalledWith(2, mockDate.toString(), {
            id: 1,
            foo: 'bar',
        })
    })

    it('should delete item if it already exists and rewrite with a new key', async () => {
        jest.useFakeTimers().setSystemTime(mockDate)
        mockLength.mockResolvedValue(1)
        mockKeys.mockResolvedValue([mockDate.toString()])
        mockIterate.mockResolvedValue(mockDate.toString())

        const {result} = renderHook(() => useRecentItems(RecentItems.Tickets))
        await waitFor(() => result.current)

        await act(async () => {
            await result.current.setRecentItem({id: 1})
            jest.runAllTimers()
            await flushPromises()
        })

        expect(mockRemoveItem).toHaveBeenCalledWith(mockDate.toString())
        expect(mockSetItem).toHaveBeenCalledWith(
            (mockDate + DEBOUNCE_TIME).toString(),
            {
                id: 1,
            }
        )
    })

    it('should delete first item if there are more than maxItems', async () => {
        jest.useFakeTimers().setSystemTime(mockDate)
        mockLength.mockResolvedValue(5)
        mockKeys.mockResolvedValue(['0', '1', '2', '3', '4'])

        const {result} = renderHook(() =>
            useRecentItems(RecentItems.Tickets, 5)
        )
        await waitFor(() => result.current)

        await act(async () => {
            await result.current.setRecentItem({id: 1})
            jest.runAllTimers()
            await flushPromises()
        })

        expect(mockRemoveItems).toHaveBeenCalledWith(['0'])
        expect(mockSetItem).toHaveBeenCalledWith(
            (mockDate + DEBOUNCE_TIME).toString(),
            {id: 1}
        )
    })
})
