import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import LD from 'launchdarkly-react-client-sdk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {DrillDownTable} from 'pages/stats/DrillDownTable'
import {DrillDownInfobar} from 'pages/stats/DrillDownInfobar'

import {RootState, StoreDispatch} from 'state/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {closeDrillDownModal} from 'state/ui/stats/drillDownSlice'
import {assumeMock} from 'utils/testing'
import {DrillDownModal} from '../DrillDownModal'

jest.mock('pages/stats/DrillDownTable')
const DrillDownTableMock = assumeMock(DrillDownTable)
jest.mock('pages/stats/DrillDownInfobar')
const DrillDownInfobarMock = assumeMock(DrillDownInfobar)

jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
    [FeatureFlagKey.AnalyticsDrillDown]: true,
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<DrillDownModal />', () => {
    const title = 'drill down'
    const metricData = {
        title,
    }
    const defaultState = {
        ui: {
            drillDown: {
                isOpen: true,
                metricData,
            },
        },
    } as unknown as RootState
    const componentMock = () => <div />

    beforeEach(() => {
        DrillDownTableMock.mockImplementation(componentMock)
        DrillDownInfobarMock.mockImplementation(componentMock)
    })

    it('should render the drill down modal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownModal />
            </Provider>
        )

        expect(screen.getByText(title)).toBeInTheDocument()
    })

    it('should render the DrillDownTable and DrillDownInfobar with metricData', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownModal />
            </Provider>
        )

        expect(DrillDownTableMock).toHaveBeenCalledWith({metricData}, {})
        expect(DrillDownInfobarMock).toHaveBeenCalledWith({metricData}, {})
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
            expect(store.getActions()).toContainEqual(closeDrillDownModal())
        })
    })
})
