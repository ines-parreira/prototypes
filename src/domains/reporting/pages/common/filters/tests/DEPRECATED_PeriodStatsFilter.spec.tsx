import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import moment from 'moment-timezone'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent, SegmentEvent } from 'common/segment'
import { DateTimeFormatMapper, DateTimeFormatType } from 'constants/datetime'
import DEPRECATED_PeriodStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_PeriodStatsFilter'
import { CALENDAR_ICON } from 'domains/reporting/pages/common/PeriodPicker'
import { getNewSetOfRanges } from 'domains/reporting/pages/constants'
import {
    initialState,
    mergeStatsFilters,
} from 'domains/reporting/state/stats/statsSlice'
import { RootState } from 'state/types'
import { formatDatetime } from 'utils'

const RENDERED_ATTRIBUTE_NAME = 'data-range-key'

const mockStore = configureMockStore([thunk])
let dateNowSpy: jest.SpiedFunction<typeof Date.now>
jest.mock('common/segment')

describe('DEPRECATED_PeriodStatsFilter', () => {
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

    it('should render period stats filter', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DEPRECATED_PeriodStatsFilter
                    value={{
                        start_datetime: '2021-05-02T19:22:43.000Z',
                        end_datetime: '2021-05-03T19:22:43.000Z',
                    }}
                />
            </Provider>,
        )
        expect(screen.getByText(CALENDAR_ICON)).toBeInTheDocument()
    })

    it('should merge stats filters on period change', () => {
        const store = mockStore(defaultState)
        const { getByText } = render(
            <Provider store={store}>
                <DEPRECATED_PeriodStatsFilter
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
                <DEPRECATED_PeriodStatsFilter value={value} />
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
                <DEPRECATED_PeriodStatsFilter value={value} />
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

    it('should render with predefined date ranges', () => {
        const store = mockStore(defaultState)
        const value = {
            start_datetime: '2020-05-02T19:22:43.000Z',
            end_datetime: '2021-05-03T19:22:43.000Z',
        }

        render(
            <Provider store={store}>
                <DEPRECATED_PeriodStatsFilter value={value} />
            </Provider>,
        )

        const defaultRangesKeys = Object.keys(getNewSetOfRanges())
        const allRangesRenderedAttributes = Array.from(
            document.querySelectorAll(`[${RENDERED_ATTRIBUTE_NAME}]`),
        ).map((e) => e.getAttribute(RENDERED_ATTRIBUTE_NAME))

        expect(allRangesRenderedAttributes).toEqual(defaultRangesKeys)
    })
})
