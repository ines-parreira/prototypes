import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {setMetricData} from 'state/ui/stats/drillDownSlice'
import {DrillDownModalTrigger} from '../DrillDownModalTrigger'

jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.AnalyticsDrillDown]: true,
}))

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

    it('should set metric data on trigger', async () => {
        const store = mockStore(defaultState)
        const metricData = {
            metricName: 'someMetric',
        } as any

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
        })
    })

    it('should not trigger drill down with false feature flag', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsDrillDown]: false,
        }))
        const store = mockStore(defaultState)
        const metricData = {
            metricName: 'someMetric',
        } as any

        render(
            <Provider store={store}>
                <DrillDownModalTrigger metricData={metricData}>
                    {trigger}
                </DrillDownModalTrigger>
            </Provider>
        )

        fireEvent.click(screen.getByText(trigger))

        expect(store.getActions()).toEqual([])
    })
})
