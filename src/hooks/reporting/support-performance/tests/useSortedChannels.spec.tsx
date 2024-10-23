import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {channelsQueryKeys as mockChannelsQueryKeys} from 'models/channel/queries'
import {channels as mockChannels} from 'fixtures/channels'
import {RootState} from 'state/types'
import {ChannelsTableColumns} from 'state/ui/stats/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {OrderDirection} from 'models/api/types'
import {useSortedChannels} from 'hooks/reporting/support-performance/useSortedChannels'
import {channelsSlice, initialState} from 'state/ui/stats/channelsSlice'

jest.mock('api/queryClient', () => ({
    appQueryClient: mockQueryClient({
        cachedData: [[mockChannelsQueryKeys.list(), mockChannels]],
    }),
}))
const mockStore = configureMockStore([thunk])

describe('useSortedChannels', () => {
    const defaultState = {
        ui: {
            stats: {[channelsSlice.name]: initialState},
        },
    } as RootState

    it('should return channels as is with default sorting', () => {
        const {result} = renderHook(() => useSortedChannels(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>
                    {' '}
                    {children}{' '}
                </Provider>
            ),
        })

        expect(result.current).toEqual({
            isLoading: false,
            sortedChannels: mockChannels,
        })
        mockChannels.forEach((ch, index) => {
            expect(result.current.sortedChannels[index]).toEqual(
                mockChannels[index]
            )
        })
    })

    it('should return channels in reversed order with default sorting', () => {
        const state = {
            ui: {
                stats: {
                    [channelsSlice.name]: {
                        sorting: {
                            field: ChannelsTableColumns.Channel,
                            direction: OrderDirection.Desc,
                            isLoading: false,
                            lastSortingMetric: null,
                        },
                        heatmapMode: false,
                    },
                },
            },
        } as RootState
        const {result} = renderHook(() => useSortedChannels(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        const reversedChannels = [...mockChannels].reverse()
        expect(result.current).toEqual({
            isLoading: false,
            sortedChannels: reversedChannels,
        })
        reversedChannels.forEach((ch, index) => {
            expect(result.current.sortedChannels[index]).toEqual(
                reversedChannels[index]
            )
        })
    })

    it('should return channels sorted by a metric order', () => {
        const channelSorting = [
            'facebook-messenger',
            'google-business-messenger',
            'facebook-recommendations',
            'aircall',
            'api',
            'contact_form',
            'tiktok-shop',
            'email',
            'facebook',
            'facebook-mention',
            'chat',
        ]
        const state = {
            ui: {
                stats: {
                    [channelsSlice.name]: {
                        sorting: {
                            field: ChannelsTableColumns.CustomerSatisfaction,
                            direction: OrderDirection.Desc,
                            isLoading: false,
                            lastSortingMetric: channelSorting,
                        },
                        heatmapMode: false,
                    },
                },
            },
        } as RootState
        const {result} = renderHook(() => useSortedChannels(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}> {children} </Provider>
            ),
        })

        const channelsWithoutSortingPosition = mockChannels
            .map((channel) => channel.slug)
            .filter((channelSlug) => !channelSorting.includes(channelSlug))

        const expectedSort = [
            ...channelSorting,
            ...channelsWithoutSortingPosition,
        ]
        expect(result.current.sortedChannels.map((ch) => ch.slug)).toEqual(
            expectedSort
        )
        expectedSort.forEach((channelSlug, index) => {
            expect(result.current.sortedChannels[index].slug).toEqual(
                channelSlug
            )
        })
    })

    it('should return channels as is if sorting order missing', () => {
        const state = {
            ui: {
                stats: {
                    [channelsSlice.name]: {
                        sorting: {
                            field: ChannelsTableColumns.CustomerSatisfaction,
                            direction: OrderDirection.Desc,
                            isLoading: false,
                            lastSortingMetric: null,
                        },
                        heatmapMode: false,
                    },
                },
            },
        } as RootState

        const {result} = renderHook(() => useSortedChannels(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}> {children} </Provider>
            ),
        })

        expect(result.current).toEqual({
            isLoading: false,
            sortedChannels: mockChannels,
        })
    })
})
