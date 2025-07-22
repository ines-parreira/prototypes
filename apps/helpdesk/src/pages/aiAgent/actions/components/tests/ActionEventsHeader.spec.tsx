import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { fromLegacyStatsFilters } from 'domains/reporting/state/stats/utils'
import { billingState } from 'fixtures/billing'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ActionEventsHeader from '../ActionEventsHeader'

const mockStore = configureMockStore([thunk])

const queryClient = mockQueryClient()
describe('<ActionEventsHeader />', () => {
    it('should render component', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const storeState = {
            stats: {
                filters: {
                    period: {
                        end_datetime: periodEnd.toISOString(),
                        start_datetime: periodStart.toISOString(),
                    },
                },
            },
        } as RootState

        renderWithRouter(
            <Provider store={mockStore(storeState)}>
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={jest.fn()}
                />
            </Provider>,
        )

        expect(
            screen.getByText(
                'View all events when this Action has been performed',
                { exact: false },
            ),
        ).toBeInTheDocument()
    })

    it('should show "Partial Success"', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const storeState = {
            stats: {
                filters: {
                    period: {
                        end_datetime: periodEnd.toISOString(),
                        start_datetime: periodStart.toISOString(),
                    },
                },
            },
        } as RootState

        renderWithRouter(
            <Provider store={mockStore(storeState)}>
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={jest.fn()}
                />
            </Provider>,
        )

        expect(screen.queryByText('Success, Error')).toBeNull()
        expect(
            screen.getByText('Success, Error, Partial Success'),
        ).toBeInTheDocument()
    })

    describe('Ticket ID filter', () => {
        const defaultStoreState = {
            stats: {
                filters: {
                    period: {
                        end_datetime: moment().toISOString(),
                        start_datetime: moment()
                            .subtract(7, 'days')
                            .toISOString(),
                    },
                },
            },
        } as RootState

        it('should render Ticket ID input field', () => {
            renderWithRouter(
                <Provider store={mockStore(defaultStoreState)}>
                    <ActionEventsHeader
                        initialEndDate={new Date()}
                        initialStartDate={new Date()}
                        onChange={jest.fn()}
                    />
                </Provider>,
            )

            expect(screen.getByLabelText('Ticket ID')).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Enter ticket ID'),
            ).toBeInTheDocument()
        })

        it('should call onChange with userJourneyId when user types and presses Enter', async () => {
            const mockOnChange = jest.fn()

            renderWithRouter(
                <Provider store={mockStore(defaultStoreState)}>
                    <ActionEventsHeader
                        initialEndDate={new Date()}
                        initialStartDate={new Date()}
                        onChange={mockOnChange}
                    />
                </Provider>,
            )

            const input = screen.getByPlaceholderText('Enter ticket ID')

            fireEvent.change(input, { target: { value: '123' } })
            fireEvent.keyDown(input, { key: 'Enter' })

            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalledWith(
                    expect.objectContaining({
                        userJourneyId: 123,
                    }),
                )
            })
        })

        it('should call onChange with userJourneyId when user types and focuses out', async () => {
            const mockOnChange = jest.fn()

            renderWithRouter(
                <Provider store={mockStore(defaultStoreState)}>
                    <ActionEventsHeader
                        initialEndDate={new Date()}
                        initialStartDate={new Date()}
                        onChange={mockOnChange}
                    />
                </Provider>,
            )

            const input = screen.getByPlaceholderText('Enter ticket ID')

            fireEvent.change(input, { target: { value: '456' } })
            fireEvent.blur(input)

            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalledWith(
                    expect.objectContaining({
                        userJourneyId: 456,
                    }),
                )
            })
        })

        it('should call onChange with undefined when input is empty', async () => {
            const mockOnChange = jest.fn()

            renderWithRouter(
                <Provider store={mockStore(defaultStoreState)}>
                    <ActionEventsHeader
                        initialEndDate={new Date()}
                        initialStartDate={new Date()}
                        onChange={mockOnChange}
                    />
                </Provider>,
            )

            const input = screen.getByPlaceholderText('Enter ticket ID')

            fireEvent.change(input, { target: { value: '' } })
            fireEvent.keyDown(input, { key: 'Enter' })

            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalledWith(
                    expect.objectContaining({
                        userJourneyId: undefined,
                    }),
                )
            })
        })

        it('should handle numeric input correctly', async () => {
            const mockOnChange = jest.fn()

            renderWithRouter(
                <Provider store={mockStore(defaultStoreState)}>
                    <ActionEventsHeader
                        initialEndDate={new Date()}
                        initialStartDate={new Date()}
                        onChange={mockOnChange}
                    />
                </Provider>,
            )

            const input = screen.getByPlaceholderText('Enter ticket ID')

            fireEvent.change(input, { target: { value: '789' } })
            fireEvent.blur(input)

            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalledWith(
                    expect.objectContaining({
                        userJourneyId: 789,
                    }),
                )
            })
        })
    })

    describe('period filter', () => {
        const statsFilters = {
            period: {
                start_datetime: '2010-01-01T00:00:00+00:00',
                end_datetime: '2010-01-01T23:59:59+02:00',
            },
        }

        const defaultStore = mockStore({
            billing: fromJS(billingState),
            stats: { filters: fromLegacyStatsFilters(statsFilters) },
        })
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
                },
            )

            expect(
                screen.getByText(
                    /View all events when this Action has been performed, and select an event to view/,
                ),
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
                },
            )

            expect(onChangeSpy.mock.lastCall).toMatchObject([
                {
                    from: expect.any(Date),
                    to: expect.any(Date),
                },
            ])

            fireEvent.click(screen.getByText('Success, Error, Partial Success'))
            fireEvent.click(
                screen.getAllByTestId('filter-dropdown-item-label')[0],
            )

            expect(onChangeSpy.mock.lastCall).toMatchObject([
                {
                    from: expect.any(Date),
                    to: expect.any(Date),
                },
            ])

            fireEvent.click(
                screen.getAllByTestId('filter-dropdown-item-label')[0],
            )
            fireEvent.click(
                screen.getAllByTestId('filter-dropdown-item-label')[1],
            )

            expect(onChangeSpy.mock.lastCall).toMatchObject([
                {
                    from: expect.any(Date),
                    to: expect.any(Date),
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
                },
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
                            statsFilters.period.start_datetime,
                        ).toLocaleDateString('en-US', options),
                        'i',
                    ),
                ),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    new RegExp(
                        new Date(
                            statsFilters.period.start_datetime,
                        ).toLocaleDateString('en-US', options),
                        'i',
                    ),
                ),
            ).toBeInTheDocument()

            expect(onChangeSpy.mock.lastCall).toMatchObject([
                {
                    from: new Date(statsFilters.period.start_datetime),
                    to: new Date(statsFilters.period.end_datetime),
                },
            ])

            fireEvent.click(
                screen.getByText(
                    new RegExp(
                        new Date(
                            statsFilters.period.start_datetime,
                        ).toLocaleDateString('en-US', options),
                        'i',
                    ),
                ),
            )

            fireEvent.click(screen.getByText('Today', { selector: 'li' }))

            expect(onChangeSpy.mock.lastCall).toMatchObject([
                {
                    from: moment(statsFilters.period.end_datetime)
                        .startOf('day')
                        .toDate(),

                    to: moment(statsFilters.period.end_datetime).toDate(),
                },
            ])

            jest.useRealTimers()
        })
    })
})
