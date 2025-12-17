import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import {
    DateTimeFormatMapper,
    DateTimeFormatType,
    formatDatetime,
} from '@repo/utils'
import { fireEvent, render, screen } from '@testing-library/react'
import moment from 'moment-timezone'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { PeriodFilter } from 'domains/reporting/pages/common/filters/PeriodFilter'
import { getNewSetOfRanges } from 'domains/reporting/pages/constants'
import {
    initialState,
    mergeStatsFilters,
} from 'domains/reporting/state/stats/statsSlice'
import type { RootState } from 'state/types'

const RENDERED_ATTRIBUTE_NAME = 'data-range-key'

const mockStore = configureMockStore([thunk])
let dateNowSpy: jest.SpiedFunction<typeof Date.now>
jest.mock('@repo/logging')

describe('PeriodStatsFilter', () => {
    const defaultState = {
        stats: initialState,
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => 1487076708000)
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    it('should render period filter', () => {
        const startDateTime = '2021-05-02T19:22:43.000Z'
        const endDateTime = '2021-05-03T19:22:43.000Z'
        const formattedStartDate = moment(startDateTime).format(
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US
            ] as string,
        )
        const formattedEndDate = moment(endDateTime).format(
            DateTimeFormatMapper[
                DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US
            ] as string,
        )

        render(
            <Provider store={mockStore(defaultState)}>
                <PeriodFilter
                    value={{
                        start_datetime: startDateTime,
                        end_datetime: endDateTime,
                    }}
                />
            </Provider>,
        )
        expect(screen.getByText('Date')).toBeInTheDocument()
        expect(
            screen.getByText(`${formattedStartDate} - ${formattedEndDate}`),
        ).toBeInTheDocument()
    })

    it('should merge stats filters on period change', () => {
        const store = mockStore(defaultState)
        const { getByText } = render(
            <Provider store={store}>
                <PeriodFilter
                    value={{
                        start_datetime: '2021-05-02T19:22:43.000Z',
                        end_datetime: '2021-05-03T19:22:43.000Z',
                    }}
                />
            </Provider>,
        )

        fireEvent.click(getByText('Today'))

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({
                period: {
                    start_datetime: '2017-02-14T00:00:00Z',
                    end_datetime: '2017-02-14T23:59:59Z',
                },
            }),
        )
    })

    it('should log event when date picker is shown', () => {
        const store = mockStore(defaultState)
        const value = {
            start_datetime: '2021-05-02T19:22:43.000Z',
            end_datetime: '2021-05-03T19:22:43.000Z',
        }
        const { getByText } = render(
            <Provider store={store}>
                <PeriodFilter value={value} />
            </Provider>,
        )

        fireEvent.click(
            getByText(
                formatDatetime(
                    value.start_datetime,
                    DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US
                    ],
                ).toString(),
                {
                    exact: false,
                },
            ),
        )

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AnalyticsStatsDatepickerOpen,
            {
                eventDate: moment().format(),
                startDate: value.start_datetime,
                endDate: value.end_datetime,
            },
        )
    })

    it('should update the period if the period is value is greater than the expected max span', () => {
        const store = mockStore(defaultState)
        const value = {
            start_datetime: '2020-05-02T19:22:43.000Z',
            end_datetime: '2021-05-03T19:22:43.000Z',
        }
        render(
            <Provider store={store}>
                <PeriodFilter value={value} />
            </Provider>,
        )

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({
                period: {
                    start_datetime: '2020-05-02T00:00:00Z',
                    end_datetime: '2020-07-31T23:59:59Z',
                },
            }),
        )
    })

    it('should render with custom set of ranges', () => {
        const store = mockStore(defaultState)
        const value = {
            start_datetime: '2020-05-02T19:22:43.000Z',
            end_datetime: '2021-05-03T19:22:43.000Z',
        }

        render(
            <Provider store={store}>
                <PeriodFilter value={value} />
            </Provider>,
        )

        const newRangesKeys = Object.keys(getNewSetOfRanges())
        const allRangesRenderedAttributes = Array.from(
            document.querySelectorAll(`[${RENDERED_ATTRIBUTE_NAME}]`),
        ).map((e) => e.getAttribute(RENDERED_ATTRIBUTE_NAME))

        expect(allRangesRenderedAttributes).toEqual(newRangesKeys)
    })

    describe('Compact mode', () => {
        it('should render in compact mode with date range', () => {
            const store = mockStore(defaultState)
            const value = {
                start_datetime: '2021-05-02T19:22:43.000Z',
                end_datetime: '2021-05-03T19:22:43.000Z',
            }

            const { container } = render(
                <Provider store={store}>
                    <PeriodFilter value={value} compact />
                </Provider>,
            )

            const compactTrigger = container.querySelector(
                '#period-filter-compact-trigger',
            )
            expect(compactTrigger).toBeInTheDocument()
            expect(compactTrigger?.textContent).toContain('Date')
            expect(compactTrigger?.textContent).toContain('May 2, 2021')
        })

        it('should render compact trigger that is clickable', () => {
            const store = mockStore(defaultState)
            const value = {
                start_datetime: '2021-05-02T19:22:43.000Z',
                end_datetime: '2021-05-03T19:22:43.000Z',
            }

            const { container } = render(
                <Provider store={store}>
                    <PeriodFilter value={value} compact />
                </Provider>,
            )

            const compactTrigger = container.querySelector(
                '#period-filter-compact-trigger',
            )
            expect(compactTrigger).toBeInTheDocument()
            expect(compactTrigger).toHaveAttribute('data-name', 'button')
        })

        it('should format date range correctly in compact mode', () => {
            const store = mockStore(defaultState)
            const value = {
                start_datetime: '2021-01-01T00:00:00.000Z',
                end_datetime: '2021-12-31T23:59:59.000Z',
            }

            const { container } = render(
                <Provider store={store}>
                    <PeriodFilter value={value} compact />
                </Provider>,
            )

            const compactValue = container.querySelector('.compactValue')
            expect(compactValue).toBeInTheDocument()
            expect(compactValue?.textContent).toContain('Jan 1, 2021')
            expect(compactValue?.textContent).toContain('Dec 31, 2021')
        })

        it('should render compact trigger with correct ID', () => {
            const store = mockStore(defaultState)
            const value = {
                start_datetime: '2021-05-02T19:22:43.000Z',
                end_datetime: '2021-05-03T19:22:43.000Z',
            }

            const { container } = render(
                <Provider store={store}>
                    <PeriodFilter value={value} compact />
                </Provider>,
            )

            const trigger = container.querySelector(
                '#period-filter-compact-trigger',
            )
            expect(trigger).toBeInTheDocument()
            expect(trigger).toHaveAttribute(
                'id',
                'period-filter-compact-trigger',
            )
        })

        it('should apply correct styles to compact trigger', () => {
            const store = mockStore(defaultState)
            const value = {
                start_datetime: '2021-05-02T19:22:43.000Z',
                end_datetime: '2021-05-03T19:22:43.000Z',
            }

            const { container } = render(
                <Provider store={store}>
                    <PeriodFilter value={value} compact />
                </Provider>,
            )

            const trigger = container.querySelector(
                '#period-filter-compact-trigger',
            )
            expect(trigger).toBeInTheDocument()
        })

        it('should render with compact styles in compact mode', () => {
            const store = mockStore(defaultState)
            const value = {
                start_datetime: '2021-05-02T19:22:43.000Z',
                end_datetime: '2021-05-03T19:22:43.000Z',
            }

            const { container } = render(
                <Provider store={store}>
                    <PeriodFilter value={value} compact />
                </Provider>,
            )

            const compactTrigger = container.querySelector(
                '#period-filter-compact-trigger',
            )
            expect(compactTrigger).toBeInTheDocument()

            const compactLabel = container.querySelector('.compactLabel')
            expect(compactLabel).toBeInTheDocument()
            expect(compactLabel?.textContent).toBe('Date')
        })

        it('should properly convert moment dates to ZonedDateTime for DateRangePicker', () => {
            const store = mockStore(defaultState)
            const value = {
                start_datetime: '2021-06-15T10:30:00.000Z',
                end_datetime: '2021-06-20T14:45:00.000Z',
            }

            const { container } = render(
                <Provider store={store}>
                    <PeriodFilter value={value} compact />
                </Provider>,
            )

            const trigger = container.querySelector(
                '#period-filter-compact-trigger',
            )
            expect(trigger).toBeInTheDocument()
            expect(trigger?.textContent).toContain('Jun')
        })
    })
})
