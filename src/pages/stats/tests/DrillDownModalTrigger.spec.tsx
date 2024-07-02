import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {logEvent, SegmentEvent} from 'common/segment'

import {RootState, StoreDispatch} from 'state/types'
import {DrillDownMetric, setMetricData} from 'state/ui/stats/drillDownSlice'
import {OverviewMetric} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
import {DrillDownModalTrigger} from '../DrillDownModalTrigger'

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownModalTrigger />', () => {
    const trigger = 'drill down trigger'
    const defaultState = {
        ui: {
            drillDown: {
                metricData: {},
            },
        },
    } as unknown as RootState

    it('should set metric data on trigger and log Segment Event', async () => {
        const store = mockStore(defaultState)
        const metricData: DrillDownMetric = {
            metricName: OverviewMetric.OpenTickets,
        }

        render(
            <Provider store={store}>
                <DrillDownModalTrigger metricData={metricData}>
                    {trigger}
                </DrillDownModalTrigger>
            </Provider>
        )

        fireEvent.click(screen.getByText(trigger))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(setMetricData(metricData))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.StatClicked,
                {metric: metricData.metricName}
            )
        })
    })

    it('should not trigger drill down with enabled prop', () => {
        const store = mockStore(defaultState)
        const metricData = {
            metricName: 'someMetric',
        } as any

        render(
            <Provider store={store}>
                <DrillDownModalTrigger enabled={false} metricData={metricData}>
                    {trigger}
                </DrillDownModalTrigger>
            </Provider>
        )

        fireEvent.click(screen.getByText(trigger))

        expect(store.getActions()).toEqual([])
    })
})
