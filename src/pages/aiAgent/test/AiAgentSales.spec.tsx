// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentSales } from '../AiAgentSales'

jest.mock('../components/SalesPaywall/SalesPaywall', () => ({
    SalesPaywall: jest.fn(() => <div data-testid="sales-paywall" />),
}))

jest.mock('../components/SalesSettings/SalesSettings', () => ({
    SalesSettings: jest.fn(() => <div data-testid="sales-settings" />),
}))

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
    describe('when feature flag is enabled', () => {
        it.each([
            { standaloneMenuFlag: false, title: 'AI Agent' },
            { standaloneMenuFlag: true, title: 'Sales Skills' },
        ])(
            'should render the sales settings with title "$title" when standalone menu flag is $standaloneMenuFlag',
            ({ standaloneMenuFlag, title }) => {
                mockFlags({
                    [FeatureFlagKey.StandaloneAIAgentSalesPage]: true,
                    [FeatureFlagKey.ConvAiStandaloneMenu]: standaloneMenuFlag,
                })
                renderComponent()

                expect(screen.getByTestId('sales-settings')).toBeInTheDocument()

                expect(
                    screen.queryByText(title, { selector: 'h1' }),
                ).toBeInTheDocument()
            },
        )
    })

    describe('when feature flag is disabled', () => {
        it.each([
            { standaloneMenuFlag: false, title: 'AI Agent' },
            { standaloneMenuFlag: true, title: 'Sales Skills' },
        ])(
            'should render the sales paywall with title "$title" when standalone menu flag is $standaloneMenuFlag',
            ({ standaloneMenuFlag, title }) => {
                mockFlags({
                    [FeatureFlagKey.StandaloneAIAgentSalesPage]: false,
                    [FeatureFlagKey.ConvAiStandaloneMenu]: standaloneMenuFlag,
                })
                renderComponent()

                expect(screen.getByTestId('sales-paywall')).toBeInTheDocument()

                expect(
                    screen.queryByText(title, { selector: 'h1' }),
                ).toBeInTheDocument()
            },
        )
    })
})
