import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import moment from 'moment-timezone'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent, SegmentEvent } from 'common/segment'
import { DateTimeFormatMapper, DateTimeFormatType } from 'constants/datetime'
import { PeriodFilter } from 'pages/stats/common/filters/PeriodFilter'
import { getNewSetOfRanges } from 'pages/stats/constants'
import { initialState, mergeStatsFilters } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { formatDatetime } from 'utils'

const RENDERED_ATTRIBUTE_NAME = 'data-range-key'

const mockStore = configureMockStore([thunk])
let dateNowSpy: jest.SpiedFunction<typeof Date.now>
jest.mock('common/segment')

describe('PeriodStatsFilter', () => {
    const defaultState = {
        stats: initialState,
    } as RootState

    beforeEach(() => {
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
})
