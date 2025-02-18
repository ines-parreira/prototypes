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
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'

import {useDisplayAiAgentMovedBanner} from '../../hooks/useDisplayAiAgentMovedBanner'

import AutomateLandingPage from '../AutomateLandingPage'

// Mock the useFlags hook
jest.mock('launchdarkly-react-client-sdk')
jest.mock('hooks/useCallbackRef', () => jest.fn(() => [null, jest.fn()]))
jest.mock('hooks/candu/useInjectStyleToCandu', () => jest.fn())
jest.mock('pages/stats/DrillDownModal', () => ({
    __esModule: true,
    DrillDownModal: () => <div>DrillDownModal</div>,
}))

jest.mock('../../hooks/useDisplayAiAgentMovedBanner', () => ({
    useDisplayAiAgentMovedBanner: jest.fn(),
}))

jest.mock('../AiAgentMovedBanner', () => ({
    AiAgentMovedBanner: () => <div>AI Agent Moved Banner</div>,
}))

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const store = mockStore({
    billing: fromJS(billingState),
} as unknown as RootState)
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

describe('AutomateLandingPage', () => {
    beforeEach(() => {
        mockUseFlags.mockReturnValue({})
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReset()
    })

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

        renderWithQueryClientProvider(
            <Provider store={store}>
                <AutomateLandingPage />
            </Provider>
        )
        expect(screen.getByText('Overview')).toBeInTheDocument()
    })

    test('renders AI Agent Moved banner when useDisplayAiAgentMovedBanner returns true', () => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReturnValue(true)

        renderWithQueryClientProvider(
            <Provider store={store}>
                <AutomateLandingPage />
            </Provider>
        )

        expect(screen.getByText('AI Agent Moved Banner')).toBeInTheDocument()
    })

    test('does not render AI Agent Moved banner when useDisplayAiAgentMovedBanner returns false', () => {
        ;(useDisplayAiAgentMovedBanner as jest.Mock).mockReturnValue(false)

        renderWithQueryClientProvider(
            <Provider store={store}>
                <AutomateLandingPage />
            </Provider>
        )

        expect(
            screen.queryByText('AI Agent Moved Banner')
        ).not.toBeInTheDocument()
    })
})
