import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fireEvent, screen} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import moment from 'moment-timezone'
import {RootState, StoreDispatch} from 'state/types'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {billingState} from 'fixtures/billing'
import {renderWithRouter} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import ActionEventsHeader from '../components/ActionEventsHeader'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const statsFilters = {
    period: {
        start_datetime: '2010-01-01T00:00:00+00:00',
        end_datetime: '2010-01-01T23:59:59+02:00',
    },
}

const defaultStore = mockStore({
    billing: fromJS(billingState),
    stats: {filters: fromLegacyStatsFilters(statsFilters)},
})

describe('ActionEventsHeader', () => {
    it('renders component', () => {
        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsHeader
                        onChange={() => {}}
                        initialStartDate={new Date()}
                        initialEndDate={new Date()}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
            }
        )

        expect(
            screen.getByText(
                /View all events when this Action has been performed, and select an event to view/
            )
        ).toBeInTheDocument()
    })

    it('change status filters', () => {
        const onChangeSpy = jest.fn()
        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsHeader
                        onChange={onChangeSpy}
                        initialStartDate={new Date()}
                        initialEndDate={new Date()}
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
            }
        )

        expect(onChangeSpy.mock.lastCall).toMatchObject([
            {
                from: expect.any(Date),
                to: expect.any(Date),
                success: undefined,
            },
        ])

        fireEvent.click(screen.getByText('Success, Error'))
        fireEvent.click(screen.getAllByTestId('filter-dropdown-item-label')[0])

        expect(onChangeSpy.mock.lastCall).toMatchObject([
            {
                from: expect.any(Date),
                to: expect.any(Date),
                success: false,
            },
        ])

        fireEvent.click(screen.getAllByTestId('filter-dropdown-item-label')[0])
        fireEvent.click(screen.getAllByTestId('filter-dropdown-item-label')[1])

        expect(onChangeSpy.mock.lastCall).toMatchObject([
            {
                from: expect.any(Date),
                to: expect.any(Date),
                success: true,
            },
        ])
    })

    it('change date period filters', () => {
        const mockedDate = new Date('2000-01-01').getTime()

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)
        const onChangeSpy = jest.fn()

        renderWithRouter(
            <Provider store={defaultStore}>
                <QueryClientProvider client={queryClient}>
                    <ActionEventsHeader
                        onChange={onChangeSpy}
                        initialStartDate={
                            new Date(statsFilters.period.start_datetime)
                        }
                        initialEndDate={
                            new Date(statsFilters.period.end_datetime)
                        }
                    />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                route: '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
            }
        )

        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        } as const

        expect(
            screen.getByText(
                new RegExp(
                    new Date(
                        statsFilters.period.start_datetime
                    ).toLocaleDateString('en-US', options),
                    'i'
                )
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                new RegExp(
                    new Date(
                        statsFilters.period.start_datetime
                    ).toLocaleDateString('en-US', options),
                    'i'
                )
            )
        ).toBeInTheDocument()

        expect(onChangeSpy.mock.lastCall).toMatchObject([
            {
                from: new Date(statsFilters.period.start_datetime),
                to: new Date(statsFilters.period.end_datetime),
                success: undefined,
            },
        ])

        fireEvent.click(
            screen.getByText(
                new RegExp(
                    new Date(
                        statsFilters.period.start_datetime
                    ).toLocaleDateString('en-US', options),
                    'i'
                )
            )
        )

        fireEvent.click(screen.getByText('Today', {selector: 'li'}))

        expect(onChangeSpy.mock.lastCall).toMatchObject([
            {
                from: moment(statsFilters.period.end_datetime)
                    .startOf('day')
                    .toDate(),

                to: moment(statsFilters.period.end_datetime).toDate(),
                success: undefined,
            },
        ])

        jest.useRealTimers()
    })
})
