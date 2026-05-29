import type { ReactNode } from 'react'
import React from 'react'

import type { DateValue } from '@internationalized/date'
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
        extraProps?: {
            warningMessage?: string
            getDateTooltip?: (date: DateValue) => ReactNode
        },
    ) => {
        const user = userEvent.setup()
        const store = mockStore(defaultState)
        const result = render(
            <Provider store={store}>
                <PeriodFilterCompact
                    value={value}
                    initialSettings={initialSettings}
                    warningMessage={extraProps?.warningMessage}
                    getDateTooltip={extraProps?.getDateTooltip}
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

        it('clamps end date to maxDate when initial end is after maxDate', () => {
            const start = '2017-02-01T00:00:00.000Z'
            const end = '2017-03-10T00:00:00.000Z'
            const maxDate = new Date('2017-02-20')

            const { store } = renderComponent(
                { start_datetime: start, end_datetime: end },
                { maxSpan: 90, maxDate },
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
                            .tz(maxDate, tz)
                            .endOf('day')
                            .format(),
                    },
                }),
            )
        })

        it('clamps end to maxDate when both maxSpan and maxDate would clamp', () => {
            const start = '2017-01-01T00:00:00.000Z'
            const end = '2017-06-01T00:00:00.000Z'
            const maxDate = new Date('2017-01-20')

            const { store } = renderComponent(
                { start_datetime: start, end_datetime: end },
                { maxSpan: 60, maxDate },
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
                            .tz(maxDate, tz)
                            .endOf('day')
                            .format(),
                    },
                }),
            )
        })

        it('does not dispatch when end is before maxDate and within maxSpan', () => {
            const start = '2017-01-01T00:00:00.000Z'
            const end = '2017-01-10T00:00:00.000Z'

            const { store } = renderComponent(
                { start_datetime: start, end_datetime: end },
                { maxDate: new Date('2017-01-15') },
            )

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

        it('excludes the Today preset when maxDate is in the past', async () => {
            const { user } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-30T00:00:00.000Z',
                },
                { maxDate: moment('2017-02-13').toDate() },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))

            await waitFor(() => {
                expect(screen.queryByText('Today')).not.toBeInTheDocument()
                expect(screen.getByText('Last 7 days')).toBeInTheDocument()
            })
        })

        it('keeps the Today preset when maxDate is today or later', async () => {
            const { user } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-30T00:00:00.000Z',
                },
                { maxDate: moment('2017-02-17').toDate() },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))

            await waitFor(() => {
                expect(screen.getByText('Today')).toBeInTheDocument()
            })
        })

        it('keeps presets visible when maxDate is in the past (range is shifted to anchor on maxDate)', async () => {
            const { user } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-30T00:00:00.000Z',
                },
                { maxDate: moment('2017-02-06').toDate() },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))

            await waitFor(() => {
                expect(screen.queryByText('Today')).not.toBeInTheDocument()
                expect(screen.getByText('Last 7 days')).toBeInTheDocument()
                expect(screen.getByText('Last 30 days')).toBeInTheDocument()
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

        it('dispatches end at maxDate when user selects the boundary date', async () => {
            const { user, store } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-08T00:00:00.000Z',
                },
                { maxDate: new Date('2017-01-10') },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))
            await user.click(
                screen.getByRole('button', { name: /January 5, 2017/ }),
            )
            await user.click(
                screen.getByRole('button', { name: /January 10, 2017/ }),
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
                                .tz('2017-01-10', tz)
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

    describe('warningMessage', () => {
        it('does not show a tooltip on hover when warningMessage is not set', async () => {
            const { user } = renderComponent({
                start_datetime: '2017-01-01T00:00:00.000Z',
                end_datetime: '2017-01-30T00:00:00.000Z',
            })

            await user.hover(screen.getByRole('button', { name: /calendar/i }))

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        })

        it('shows the tooltip message on hover when warningMessage is set', async () => {
            const message = 'Data restricted to up to 3 days ago'
            const { user } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-30T00:00:00.000Z',
                },
                undefined,
                { warningMessage: message },
            )

            await user.hover(screen.getByRole('button', { name: /calendar/i }))

            await waitFor(() => {
                expect(screen.getByText(message)).toBeInTheDocument()
            })
        })
    })

    describe('getDateTooltip', () => {
        // Axiom wraps each day cell in a tooltip trigger only when getDateTooltip
        // is supplied, so the wrapper's presence is what tells us the prop reached
        // the DateRangePicker. Opening the cell tooltip on hover is not reliable in
        // jsdom, and the tooltip content rendering is already covered by axiom.
        const queryDayTooltipTriggers = () =>
            document.querySelectorAll('[data-name="tooltip-trigger"]')

        const openCalendarShowingJanuary2017 = async (
            user: ReturnType<typeof userEvent.setup>,
        ) => {
            await user.click(screen.getByRole('button', { name: /calendar/i }))
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /January 15, 2017/ }),
                ).toBeInTheDocument()
            })
        }

        it('wraps day cells in a tooltip trigger when getDateTooltip is provided', async () => {
            const { user } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-30T00:00:00.000Z',
                },
                undefined,
                { getDateTooltip: (date) => `Day ${date.day}` },
            )

            await openCalendarShowingJanuary2017(user)

            expect(queryDayTooltipTriggers().length).toBeGreaterThan(0)
        })

        it('does not wrap day cells in a tooltip trigger when getDateTooltip is not provided', async () => {
            const { user } = renderComponent({
                start_datetime: '2017-01-01T00:00:00.000Z',
                end_datetime: '2017-01-30T00:00:00.000Z',
            })

            await openCalendarShowingJanuary2017(user)

            expect(queryDayTooltipTriggers()).toHaveLength(0)
        })
    })

    describe('preset shift on maxDate', () => {
        it('shifts a preset range back so end = maxDate when the preset would exceed it', async () => {
            const maxDate = moment('2017-02-11').toDate()

            const { user, store } = renderComponent(
                {
                    start_datetime: '2017-01-01T00:00:00.000Z',
                    end_datetime: '2017-01-30T00:00:00.000Z',
                },
                { maxDate },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))
            await user.click(screen.getByText('Last 7 days'))

            const tz = moment.tz.guess()
            await waitFor(() => {
                expect(store.getActions()).toContainEqual(
                    mergeStatsFilters({
                        period: {
                            start_datetime: moment
                                .tz(maxDate, tz)
                                .subtract(6, 'days')
                                .startOf('day')
                                .format(),
                            end_datetime: moment
                                .tz(maxDate, tz)
                                .endOf('day')
                                .format(),
                        },
                    }),
                )
            })
        })

        it('hides a preset whose shifted start would fall before minDate', async () => {
            const { user } = renderComponent(
                {
                    start_datetime: '2017-02-09T00:00:00.000Z',
                    end_datetime: '2017-02-10T00:00:00.000Z',
                },
                {
                    maxDate: moment('2017-02-11').toDate(),
                    minDate: moment('2017-02-08').toDate(),
                },
            )

            await user.click(screen.getByRole('button', { name: /calendar/i }))

            await waitFor(() => {
                expect(
                    screen.queryByText('Last 7 days'),
                ).not.toBeInTheDocument()
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
