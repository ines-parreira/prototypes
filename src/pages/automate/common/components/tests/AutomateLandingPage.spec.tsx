import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {billingState} from 'fixtures/billing'
import {RootState, StoreDispatch} from 'state/types'
import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'

import AutomateLandingPage from '../AutomateLandingPage'

// Mock the useFlags hook
jest.mock('launchdarkly-react-client-sdk')
jest.mock('hooks/useCallbackRef', () => jest.fn(() => [null, jest.fn()]))
jest.mock('hooks/candu/useInjectStyleToCandu', () => jest.fn())
jest.mock('pages/stats/DrillDownModal', () => ({
    __esModule: true,
    DrillDownModal: () => <div>DrillDownModal</div>,
}))

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const store = mockStore({
    billing: fromJS(billingState),
    ui: {
        [drillDownSlice.name]: initialState,
    },
} as unknown as RootState)
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

describe('AutomateLandingPage', () => {
    test('renders with default title "Automate"', () => {
        renderWithQueryClientProvider(
            <Provider store={store}>
                <AutomateLandingPage />
            </Provider>
        )
        expect(screen.getByText('Automate')).toBeInTheDocument()
    })

    test('renders with title "Overview" when ImprovedAutomateNavigation is enabled', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ImprovedAutomateNavigation]: true,
        })
        screen.debug()
        renderWithQueryClientProvider(
            <Provider store={store}>
                <AutomateLandingPage />
            </Provider>
        )
        expect(screen.getByText('Overview')).toBeInTheDocument()
    })
})
