import React from 'react'
import {screen} from '@testing-library/react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'
import {drillDownSlice, initialState} from 'state/ui/stats/drillDownSlice'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {FeatureFlagKey} from 'config/featureFlags'
import AutomateLandingPage from '../AutomateLandingPage'

// Mock the useFlags hook
jest.mock('launchdarkly-react-client-sdk')
jest.mock('hooks/useCallbackRef', () => jest.fn(() => [null, jest.fn()]))
jest.mock('hooks/candu/useInjectStyleToCandu', () => jest.fn())

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const store = mockStore({
    billing: fromJS(billingState),
    ui: {
        [drillDownSlice.name]: initialState,
    },
} as RootState)
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
