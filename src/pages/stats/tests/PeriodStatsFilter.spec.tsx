import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fireEvent, render} from '@testing-library/react'
import moment from 'moment-timezone'
import LD from 'launchdarkly-react-client-sdk'

import {logEvent, SegmentEvent} from 'common/segment'
import {initialState, mergeStatsFilters} from 'state/stats/statsSlice'
import {formatDatetime} from 'utils'
import {DateTimeFormatMapper, DateTimeFormatType} from 'constants/datetime'
import {FeatureFlagKey} from 'config/featureFlags'
import PeriodStatsFilter, {
    getNewSetOfRanges,
} from 'pages/stats/PeriodStatsFilter'
import {getDefaultSetOfRanges} from 'pages/stats/common/PeriodPicker'
import {RootState} from 'state/types'

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

        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.NewDatePickerVariant]: false,
        }))
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    it('should render period stats filter', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <PeriodStatsFilter
                    value={{
                        start_datetime: '2021-05-02T19:22:43.000Z',
                        end_datetime: '2021-05-03T19:22:43.000Z',
                    }}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should merge stats filters on period change', () => {
        const store = mockStore(defaultState)
        const {getByText} = render(
            <Provider store={store}>
                <PeriodStatsFilter
                    value={{
                        start_datetime: '2021-05-02T19:22:43.000Z',
                        end_datetime: '2021-05-03T19:22:43.000Z',
                    }}
                />
            </Provider>
        )

        fireEvent.click(getByText('Today'))

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({
                period: {
                    start_datetime: '2017-02-14T00:00:00Z',
                    end_datetime: '2017-02-14T23:59:59Z',
                },
            })
        )
    })

    it('should log event when date picker is shown', () => {
        const store = mockStore(defaultState)
        const value = {
            start_datetime: '2021-05-02T19:22:43.000Z',
            end_datetime: '2021-05-03T19:22:43.000Z',
        }
        const {getByText} = render(
            <Provider store={store}>
                <PeriodStatsFilter value={value} />
            </Provider>
        )

        fireEvent.click(
            getByText(
                formatDatetime(
                    value.start_datetime,
                    DateTimeFormatMapper[
                        DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US
                    ]
                ).toString(),
                {
                    exact: false,
                }
            )
        )

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AnalyticsStatsDatepickerOpen,
            {
                eventDate: moment().format(),
                startDate: value.start_datetime,
                endDate: value.end_datetime,
            }
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
                <PeriodStatsFilter value={value} />
            </Provider>
        )

        expect(store.getActions()).toContainEqual(
            mergeStatsFilters({
                period: {
                    start_datetime: '2020-05-02T00:00:00Z',
                    end_datetime: '2020-07-31T23:59:59Z',
                },
            })
        )
    })

    it('should render with default set of ranges', () => {
        const store = mockStore(defaultState)
        const value = {
            start_datetime: '2020-05-02T19:22:43.000Z',
            end_datetime: '2021-05-03T19:22:43.000Z',
        }

        render(
            <Provider store={store}>
                <PeriodStatsFilter value={value} />
            </Provider>
        )

        const defaultRangesKeys = Object.keys(getDefaultSetOfRanges())
        const allRangesRenderedAttributes = Array.from(
            document.querySelectorAll(`[${RENDERED_ATTRIBUTE_NAME}]`)
        ).map((e) => e.getAttribute(RENDERED_ATTRIBUTE_NAME))

        expect(allRangesRenderedAttributes).toEqual(defaultRangesKeys)
    })

    it('should render with custom set of ranges', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.NewDatePickerVariant]: true,
        }))
        const store = mockStore(defaultState)
        const value = {
            start_datetime: '2020-05-02T19:22:43.000Z',
            end_datetime: '2021-05-03T19:22:43.000Z',
        }

        render(
            <Provider store={store}>
                <PeriodStatsFilter value={value} />
            </Provider>
        )

        const newRangesKeys = Object.keys(getNewSetOfRanges())
        const allRangesRenderedAttributes = Array.from(
            document.querySelectorAll(`[${RENDERED_ATTRIBUTE_NAME}]`)
        ).map((e) => e.getAttribute(RENDERED_ATTRIBUTE_NAME))

        expect(allRangesRenderedAttributes).toEqual(newRangesKeys)
    })
})
