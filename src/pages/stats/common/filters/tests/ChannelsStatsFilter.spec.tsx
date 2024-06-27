import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {initialState, mergeStatsFilters} from 'state/stats/statsSlice'

import {RootState} from 'state/types'

import {channelsQueryKeys as mockChannelsQueryKeys} from 'models/channel/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {channels as mockChannels} from 'fixtures/channels'
import {Channel} from 'services/channels'
import {TicketChannel} from 'business/types/ticket'

import DEPRECATED_ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'

jest.mock('api/queryClient', () => ({
    appQueryClient: mockQueryClient({
        cachedData: [[mockChannelsQueryKeys.list(), mockChannels]],
    }),
}))

const mockStore = configureMockStore([thunk])

describe('DEPRECATED_ChannelsStatsFilter', () => {
    const defaultState = {
        stats: initialState,
    } as RootState

    const defaultStore = mockStore(defaultState)

    it('should render channels stats filter', () => {
        const {container} = render(
            <Provider store={defaultStore}>
                <DEPRECATED_ChannelsStatsFilter value={[]} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render all available chanels by default', () => {
        const {queryByText} = render(
            <Provider store={defaultStore}>
                <DEPRECATED_ChannelsStatsFilter value={[]} />
            </Provider>
        )

        expect(queryByText('All channels')).toBeInTheDocument()

        mockChannels.forEach((channel: Channel) => {
            expect(queryByText(channel.name)).toBeInTheDocument()
        })
    })

    describe('restricting the list of displayed channels', () => {
        it('should allow restricting the channels that get displayed', () => {
            const {queryByText} = render(
                <Provider store={defaultStore}>
                    <DEPRECATED_ChannelsStatsFilter
                        value={[]}
                        channelsFilter={[TicketChannel.Email]}
                    />
                </Provider>
            )
            expect(queryByText('Email')).toBeInTheDocument()
            expect(queryByText('SMS')).not.toBeInTheDocument()
        })

        it('should not display a passed value that is not included in the filter', () => {
            const {queryByText} = render(
                <Provider store={defaultStore}>
                    <DEPRECATED_ChannelsStatsFilter
                        value={[TicketChannel.Sms]}
                        channelsFilter={[TicketChannel.Email]}
                    />
                </Provider>
            )
            expect(queryByText('Email')).toBeInTheDocument()
            expect(queryByText('SMS')).not.toBeInTheDocument()
        })

        it('should allow passing a predicate function to filter channels', () => {
            const {queryByText} = render(
                <Provider store={defaultStore}>
                    <DEPRECATED_ChannelsStatsFilter
                        value={[]}
                        channelsFilter={(channel) =>
                            channel.logo_url?.endsWith('email.svg') ?? false
                        }
                    />
                </Provider>
            )
            expect(queryByText('Email')).toBeInTheDocument()
            expect(queryByText('SMS')).not.toBeInTheDocument()
        })
    })

    describe('selecting channels', () => {
        it('should handle channel selection, updating filters', () => {
            const store = mockStore(defaultState)
            const {getByLabelText} = render(
                <Provider store={store}>
                    <DEPRECATED_ChannelsStatsFilter value={undefined} />
                </Provider>
            )

            fireEvent.click(getByLabelText('Email'))
            fireEvent.click(getByLabelText('TikTok Shop'))

            expect(store.getActions()).toEqual([
                mergeStatsFilters({channels: [TicketChannel.Email]}),
                mergeStatsFilters({channels: ['tiktok-shop']}),
            ])
        })

        it('should show which channels are selected (1 selected)', () => {
            const {queryByText} = render(
                <Provider store={defaultStore}>
                    <DEPRECATED_ChannelsStatsFilter
                        value={[TicketChannel.Email]}
                    />
                </Provider>
            )

            expect(queryByText('All channels')).not.toBeInTheDocument()
            expect(queryByText('1 channel')).toBeInTheDocument()
            expect(queryByText('Deselect')).toBeInTheDocument()
        })

        it('should show which channels are selected (2 selected)', () => {
            const {queryByText} = render(
                <Provider store={defaultStore}>
                    <DEPRECATED_ChannelsStatsFilter
                        value={[TicketChannel.Email, TicketChannel.Sms]}
                    />
                </Provider>
            )

            expect(queryByText('All channels')).not.toBeInTheDocument()
            expect(queryByText('2 channels')).toBeInTheDocument()
            expect(queryByText('Deselect all')).toBeInTheDocument()
        })
    })
})
