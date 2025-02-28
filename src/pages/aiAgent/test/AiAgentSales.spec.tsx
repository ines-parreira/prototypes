import React from 'react'

import { screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'

import { mockStore, renderWithRouter } from 'utils/testing'

import { FeatureFlagKey } from '../../../config/featureFlags'
import { AiAgentSales } from '../AiAgentSales'

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore({})}>
            <AiAgentSales />
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
        })
        renderComponent()

        expect(screen.queryByText('Sales skills')).toBeInTheDocument()
    })
})
