import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import moment from 'moment'

import type { RootState } from 'state/types'

import { ActionEventsHeader } from '../ActionEventsHeader'

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
        render(
            <ActionEventsHeader
                initialEndDate={new Date()}
                initialStartDate={new Date()}
                onChange={jest.fn()}
            />,
            {
                storeState: storeState,
            },
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
        render(
            <ActionEventsHeader
                initialEndDate={new Date()}
                initialStartDate={new Date()}
                onChange={jest.fn()}
            />,
            {
                storeState: storeState,
            },
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
            render(
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={jest.fn()}
                />,
                {
                    storeState: defaultStoreState,
                },
            )
            expect(screen.getByLabelText('Ticket ID')).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText('Enter Ticket ID'),
            ).toBeInTheDocument()
        })
        it('should call onChange with userJourneyId when user types and presses Enter', async () => {
            const mockOnChange = jest.fn()
            render(
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={mockOnChange}
                />,
                {
                    storeState: defaultStoreState,
                },
            )
            const input = screen.getByPlaceholderText('Enter Ticket ID')
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
            render(
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={mockOnChange}
                />,
                {
                    storeState: defaultStoreState,
                },
            )
            const input = screen.getByPlaceholderText('Enter Ticket ID')
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
            render(
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={mockOnChange}
                />,
                {
                    storeState: defaultStoreState,
                },
            )
            const input = screen.getByPlaceholderText('Enter Ticket ID')
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
            render(
                <ActionEventsHeader
                    initialEndDate={new Date()}
                    initialStartDate={new Date()}
                    onChange={mockOnChange}
                />,
                {
                    storeState: defaultStoreState,
                },
            )
            const input = screen.getByPlaceholderText('Enter Ticket ID')
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
        const storeState = {
            stats: {
                filters: statsFilters,
            },
        } as RootState

        it('renders component', () => {
            render(
                <ActionEventsHeader
                    onChange={() => {}}
                    initialStartDate={new Date()}
                    initialEndDate={new Date()}
                />,
                {
                    path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                    initialEntries: [
                        '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
                    ],
                    storeState,
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
            render(
                <ActionEventsHeader
                    onChange={onChangeSpy}
                    initialStartDate={new Date()}
                    initialEndDate={new Date()}
                />,
                {
                    path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                    initialEntries: [
                        '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
                    ],
                    storeState,
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
            render(
                <ActionEventsHeader
                    onChange={onChangeSpy}
                    initialStartDate={
                        new Date(statsFilters.period.start_datetime)
                    }
                    initialEndDate={new Date(statsFilters.period.end_datetime)}
                />,
                {
                    path: '/:shopType/:shopName/ai-agent/actions/events/:id',
                    initialEntries: [
                        '/shopify/my-shop/ai-agent/actions/events/01J0KCFRTMPCESV2KYRG29GQ9H',
                    ],
                    storeState,
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
