import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {toggleDrillDownModal} from 'state/ui/stats/drillDownSlice'
import {DrillDownModal} from '../DrillDownModal'

jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.AnalyticsDrillDown]: true,
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownModal />', () => {
    const title = 'drill down'
    const defaultState = {
        ui: {
            drillDown: {
                isOpen: true,
                metricData: {
                    title,
                },
            },
        },
    } as unknown as RootState

    it('should render the drill down modal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownModal />
            </Provider>
        )

        expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('should close the modal', async () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <DrillDownModal />
            </Provider>
        )

        fireEvent.click(screen.getByText('close'))

        await waitFor(() => {
            expect(store.getActions()).toContainEqual(toggleDrillDownModal())
        })
    })
})
