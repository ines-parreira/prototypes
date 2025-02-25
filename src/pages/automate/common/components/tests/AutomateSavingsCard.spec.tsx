import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { billingState } from 'fixtures/billing'
import { user } from 'fixtures/users'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { AutomateSavingsCard } from '../AutomateSavingsCard'

// Mock the useFlags hook and other necessary hooks
jest.mock('launchdarkly-react-client-sdk')

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const store = mockStore({
    currentUser: fromJS(user),
    billing: fromJS(billingState),
} as RootState)
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

describe('AutomateSavingsCard', () => {
    beforeEach(() => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ObservabilityTicketTimeToHandle]: true,
            [FeatureFlagKey.ObservabilityROICalculator]: true,
        })
    })

    test('renders savings information correctly', () => {
        renderWithQueryClientProvider(
            <Provider store={store}>
                <AutomateSavingsCard
                    moneySavedPerInteraction={10}
                    automatedInteractions={100}
                    resolutionTime={3600}
                    firstResponseTime={1800}
                    ticketHandleTime={300}
                    hasAgentCosts={true}
                />
            </Provider>,
        )

        expect(screen.getByText('$1,000')).toBeInTheDocument()
        expect(screen.getByText('In support costs')).toBeInTheDocument()
        expect(screen.getByText('8h 20m')).toBeInTheDocument()
        expect(screen.getByText("Of agents' time")).toBeInTheDocument()
    })
})
