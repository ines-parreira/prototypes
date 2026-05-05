import React from 'react'

import { render } from '@repo/testing'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import moment from 'moment-timezone'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { PeriodFilterCompact } from 'domains/reporting/pages/common/filters/PeriodFilterCompact'
import {
    initialState,
    mergeStatsFilters,
} from 'domains/reporting/state/stats/statsSlice'
import type { RootState } from 'state/types'

const mockStore = configureMockStore([thunk])

const defaultState = {
    stats: initialState,
} as RootState

const SHORT_DATE_FORMAT = DateTimeFormatMapper[
    DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US
] as string

describe('PeriodFilterCompact', () => {
    let dateNowSpy: jest.SpiedFunction<typeof Date.now>

    beforeEach(() => {
        jest.clearAllMocks()
        // Fixed "today": Feb 14, 2017
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => 1487076708000)
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    const renderComponent = (
        value: { start_datetime: string; end_datetime: string },
        initialSettings?: { maxSpan?: number; minDate?: Date; maxDate?: Date },
    ) => {
        const user = userEvent.setup()
        const store = mockStore(defaultState)
        const result = render(
            <Provider store={store}>
                <PeriodFilterCompact
                    value={value}
                    initialSettings={initialSettings}
                />
            </Provider>,
        )
        return { ...result, store, user }
    }

    it('renders the trigger button with a Date label and formatted range', () => {
        const start = '2024-01-10T00:00:00.000Z'
        const end = '2024-01-20T00:00:00.000Z'
        renderComponent({ start_datetime: start, end_datetime: end })

        expect(screen.getByText('Date')).toBeInTheDocument()
        expect(
            screen.getByText(
                `${moment(start).format(SHORT_DATE_FORMAT)} – ${moment(end).format(SHORT_DATE_FORMAT)}`,
            ),
        ).toBeInTheDocument()
    })

    describe('mount clamping', () => {
        it('clamps end date to default maxSpan (90 days) when initial span is too wide', () => {
            const start = '2021-01-01T00:00:00.000Z'
            const end = '2021-12-31T00:00:00.000Z' // ~364 days

            const { store } = renderComponent({
                start_datetime: start,
                end_datetime: end,
            })

            const tz = moment.tz.guess()
            expect(store.getActions()).toContainEqual(
                mergeStatsFilters({
                    period: {
                        start_datetime: moment
                            .tz(start, tz)
                            .startOf('day')
                            .format(),
                        end_datetime: moment
                            .tz(start, tz)
                            .add(90, 'days')
                            .subtract(1, 'seconds')
                            .format(),
                    },
                }),
            )
        })

        it('clamps end date to custom maxSpan when initial span exceeds it', () => {
            const start = '2024-01-01T00:00:00.000Z'
            const end = '2024-12-31T00:00:00.000Z' // ~365 days

            const { store } = renderComponent(
                { start_datetime: start, end_datetime: end },
                { maxSpan: 30 },
            )

            const tz = moment.tz.guess()
            expect(store.getActions()).toContainEqual(
                mergeStatsFilters({
                    period: {
                        start_datetime: moment
                            .tz(start, tz)
                            .startOf('day')
                            .format(),
                        end_datetime: moment
                            .tz(start, tz)
                            .add(30, 'days')
                            .subtract(1, 'seconds')
                            .format(),
                    },
                }),
            )
        })

        it('does not dispatch when initial span is within maxSpan', () => {
            const start = '2024-01-01T00:00:00.000Z'
            const end = '2024-01-30T00:00:00.000Z' // 29 days

            const { store } = renderComponent({
                start_datetime: start,
                end_datetime: end,
            })

            expect(store.getActions()).toHaveLength(0)
        })
    })

    describe('preset filtering', () => {
        it('shows presets within default maxSpan (90 days) when no minDate is set', async () => {
            const { user } = renderComponent({
                start_datetime: '2017-01-01T00:00:00.000Z',
                end_datetime: '2017-01-30T00:00:00.000Z',
            })

            await user.click(screen.getByRole('button', { name: /calendar/i }))

            await waitFor(() => {
                expect(screen.getByText('Today')).toBeInTheDocument()
                expect(screen.getByText('Last 7 days')).toBeInTheDocument()
                expect(screen.getByText('Last 30 days')).toBeInTheDocument()
                expect(screen.getByText('Last 60 days')).toBeInTheDocument()
                expect(
                    screen.queryByText('Last 3 months'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Last 6 months'),
                ).not.toBeInTheDocument()
                expect(screen.queryByText('Last year')).not.toBeInTheDocument()
            })
        })

        it('filters out presets that exceed effectiveMaxSpan', async () => {
            const { user } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-30T00:00:00.000Z',
                },
                { maxSpan: 30 },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))

            await waitFor(() => {
                expect(
                    screen.queryByText('Last 60 days'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Last 3 months'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Last 6 months'),
                ).not.toBeInTheDocument()
                expect(screen.queryByText('Last year')).not.toBeInTheDocument()
                expect(screen.getByText('Last 30 days')).toBeInTheDocument()
                expect(screen.getByText('Last 7 days')).toBeInTheDocument()
                expect(screen.getByText('Today')).toBeInTheDocument()
            })
        })

        it('filters out presets whose start falls before minDate', async () => {
            const minDate = moment('2016-12-15').toDate()

            const { user } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-30T00:00:00.000Z',
                },
                { minDate },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))

            await waitFor(() => {
                expect(screen.queryByText('Last year')).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Last 6 months'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Last 3 months'),
                ).not.toBeInTheDocument()
                expect(screen.getByText('Last 60 days')).toBeInTheDocument()
                expect(screen.getByText('Last 30 days')).toBeInTheDocument()
                expect(screen.getByText('Last 7 days')).toBeInTheDocument()
            })
        })
    })

    describe('isDateUnavailable', () => {
        it('marks dates before minDate as unavailable', async () => {
            const { user } = renderComponent(
                {
                    start_datetime: '2017-01-15T00:00:00.000Z',
                    end_datetime: '2017-01-30T00:00:00.000Z',
                },
                { minDate: new Date('2017-01-10') },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /January 9, 2017/ }),
                ).toHaveAttribute('aria-disabled', 'true')
                expect(
                    screen.getByRole('button', { name: /January 11, 2017/ }),
                ).not.toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('marks dates after maxDate as unavailable', async () => {
            const { user } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-15T00:00:00.000Z',
                },
                { maxDate: new Date('2017-01-20') },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /January 21, 2017/ }),
                ).toHaveAttribute('aria-disabled', 'true')
                expect(
                    screen.getByRole('button', { name: /January 19, 2017/ }),
                ).not.toHaveAttribute('aria-disabled', 'true')
            })
        })
    })

    describe('handleChange', () => {
        it('dispatches period update when a date range is selected', async () => {
            const { user, store } = renderComponent({
                start_datetime: '2017-01-01T00:00:00.000Z',
                end_datetime: '2017-01-30T00:00:00.000Z',
            })

            await user.click(screen.getByRole('button', { name: /calendar/i }))
            await user.click(
                screen.getByRole('button', { name: /January 5, 2017/ }),
            )
            await user.click(
                screen.getByRole('button', { name: /January 15, 2017/ }),
            )

            const tz = moment.tz.guess()
            await waitFor(() => {
                expect(store.getActions()).toContainEqual(
                    mergeStatsFilters({
                        period: {
                            start_datetime: moment
                                .tz('2017-01-05', tz)
                                .startOf('day')
                                .format(),
                            end_datetime: moment
                                .tz('2017-01-15', tz)
                                .endOf('day')
                                .format(),
                        },
                    }),
                )
            })
        })

        it('clamps end date to effectiveMaxSpan when selected range is too wide', async () => {
            const { user, store } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-30T00:00:00.000Z',
                },
                { maxSpan: 7 },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))
            await user.click(
                screen.getByRole('button', { name: /January 5, 2017/ }),
            )
            await user.click(
                screen.getByRole('button', { name: /January 20, 2017/ }),
            )

            const tz = moment.tz.guess()
            await waitFor(() => {
                expect(store.getActions()).toContainEqual(
                    mergeStatsFilters({
                        period: {
                            start_datetime: moment
                                .tz('2017-01-05', tz)
                                .startOf('day')
                                .format(),
                            end_datetime: moment
                                .tz('2017-01-05', tz)
                                .startOf('day')
                                .add(7, 'days')
                                .subtract(1, 'seconds')
                                .format(),
                        },
                    }),
                )
            })
        })
    })

    describe('timezone handling', () => {
        const originalDefaultZone = moment.tz.guess()

        beforeEach(() => {
            moment.tz.setDefault('Pacific/Auckland')
            jest.spyOn(moment.tz, 'guess').mockReturnValue('Pacific/Auckland')
        })

        afterEach(() => {
            moment.tz.setDefault(originalDefaultZone)
        })

        it('formats the trigger label in the guessed timezone so it matches the picker selection', async () => {
            const user = userEvent.setup()
            const store = mockStore(defaultState)
            const { rerender } = render(
                <Provider store={store}>
                    <PeriodFilterCompact
                        value={{
                            start_datetime: '2017-01-01T00:00:00+13:00',
                            end_datetime: '2017-01-30T23:59:59+13:00',
                        }}
                    />
                </Provider>,
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))
            await user.click(
                screen.getByRole('button', { name: /January 5, 2017/ }),
            )
            await user.click(
                screen.getByRole('button', { name: /January 15, 2017/ }),
            )

            const dispatched = store.getActions().at(-1)
            expect(dispatched).toEqual(
                mergeStatsFilters({
                    period: {
                        start_datetime: expect.any(String),
                        end_datetime: expect.any(String),
                    },
                }),
            )

            rerender(
                <Provider store={store}>
                    <PeriodFilterCompact value={dispatched.payload.period} />
                </Provider>,
            )

            expect(
                screen.getByText('Jan 5, 2017 – Jan 15, 2017'),
            ).toBeInTheDocument()
        })
    })
})
