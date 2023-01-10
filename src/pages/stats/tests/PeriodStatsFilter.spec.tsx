import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {fireEvent, render} from '@testing-library/react'
import moment from 'moment-timezone'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {RootState} from '../../../state/types'
import PeriodStatsFilter from '../PeriodStatsFilter'

const mockStore = configureMockStore([thunk])
let dateNowSpy: jest.SpiedFunction<typeof Date.now>
jest.mock('store/middlewares/segmentTracker')

describe('PeriodStatsFilter', () => {
    const defaultState = {
        stats: fromJS({
            filters: null,
        }),
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

        expect(store.getActions()).toMatchSnapshot()
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
            getByText(moment(value.start_datetime).format('MMM DD, YYYY'), {
                exact: false,
            })
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
})
