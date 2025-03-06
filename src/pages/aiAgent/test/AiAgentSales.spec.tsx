import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentSales } from '../AiAgentSales'

const queryClient = mockQueryClient()

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore({})}>
            <QueryClientProvider client={queryClient}>
                <AiAgentSales />
            </QueryClientProvider>
        </Provider>,
    )

describe('<AiAgentSales />', () => {
    it('should render the sales paywall by default', () => {
        renderComponent()

        expect(screen.queryByText('Sales skills')).not.toBeInTheDocument()
    })

    it('should render the sales settings when feature flag is enabled', () => {
        mockFlags({
            [FeatureFlagKey.StandaloneAIAgentSalesPage]: true,
            [FeatureFlagKey.StandaloneAIAgentSalesPaywallPage]: false,
            [FeatureFlagKey.ConvAiStandaloneMenu]: true,
        })
        renderComponent()

        expect(screen.queryByText('Sales skills')).toBeInTheDocument()
    })
})
