import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { AGENT_ROLE } from 'config/user'
import { HTTP_INTEGRATION_TYPE } from 'constants/integration'
import {
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPlan,
    products,
} from 'fixtures/productPrices'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import {
    AiAgentPaywallView,
    AiAgentPaywallViewProps,
} from '../AiAgentPaywallView'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('common/segment')

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
const queryClient = mockQueryClient()

const defaultState = {
    integrations: fromJS({
        integrations: [{ type: HTTP_INTEGRATION_TYPE }],
    }),
    ticket: fromJS(ticket),
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: legacyBasicHelpdeskPlan.price_id,
            },
        },
    }),
    currentUser: fromJS({
        ...user,
        role: { name: AGENT_ROLE },
    }),
    billing: fromJS({ products }),
}
const defaultProps = {
    aiAgentPaywallFeature: AIAgentPaywallFeatures.SalesSetup,
    children: <button>Set Up AI Agent</button>,
}

const renderComponent = (props: AiAgentPaywallViewProps = defaultProps) =>
    render(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <AiAgentPaywallView {...props} />
            </Provider>
        </QueryClientProvider>,
    )

describe('<AiAgentPaywallView />', () => {
    beforeEach(() => {
        mockLogEvent.mockClear()
    })

    it('should render the sales paywall component', () => {
        renderComponent()

        expect(screen.getByText(/Set Up AI Agent/)).toBeInTheDocument()
        expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('logs event on mount', () => {
        renderComponent()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallVisited,
            {
                location: AIAgentPaywallFeatures.SalesSetup,
            },
        )
    })

    it('displays Support tab by default', () => {
        renderComponent()

        expect(screen.getAllByRole('radio')[0]).toBeChecked()
    })

    it('changes image to Sales when the corresponding option is selected', async () => {
        renderComponent()

        await userEvent.click(screen.getByText('Shopping Assistant'))

        expect(screen.getAllByRole('radio')[1]).toBeChecked()
    })

    it('hides the learn more button when "hideLearnMore" is true', () => {
        renderComponent({
            aiAgentPaywallFeature: AIAgentPaywallFeatures.SalesWaitlist,
        })
        expect(screen.queryByText('Learn more')).not.toBeInTheDocument()
    })

    it('shows the learn more button when "hideLearnMore" is false', () => {
        renderComponent({
            aiAgentPaywallFeature: AIAgentPaywallFeatures.Automate,
        })
        expect(screen.queryByText('Learn more')).toBeInTheDocument()
    })

    it('logs event on click of the learn more button', async () => {
        renderComponent({
            aiAgentPaywallFeature: AIAgentPaywallFeatures.Automate,
        })

        await userEvent.click(screen.getByText('Learn more'))

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallLearnMore,
        )
    })

    it('does not display ROI Calculator button when feature flag is disabled', () => {
        renderComponent({
            aiAgentPaywallFeature: AIAgentPaywallFeatures.Automate,
        })

        expect(
            screen.queryByText('Calculate Potential Return on Investment'),
        ).not.toBeInTheDocument()
    })

    it('displays ROI Calculator button when feature flag is enabled', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ObservabilityROICalculator]: true,
        })
        renderComponent({
            aiAgentPaywallFeature: AIAgentPaywallFeatures.Automate,
        })

        expect(
            screen.getByText('Calculate Potential Return on Investment'),
        ).toBeInTheDocument()
    })

    it('opens ROI Calculator modal on button click', async () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ObservabilityROICalculator]: true,
        })

        renderComponent({
            aiAgentPaywallFeature: AIAgentPaywallFeatures.Automate,
        })

        await userEvent.click(
            screen.getByText('Calculate Potential Return on Investment'),
        )
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('closes ROI Calculator modal on click of the cancel button', async () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ObservabilityROICalculator]: true,
        })

        renderComponent({
            aiAgentPaywallFeature: AIAgentPaywallFeatures.Automate,
        })

        await userEvent.click(
            screen.getByText('Calculate Potential Return on Investment'),
        )
        expect(screen.getByRole('dialog')).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('opens AI Agent subscription modal on button click', async () => {
        renderComponent({
            aiAgentPaywallFeature: AIAgentPaywallFeatures.Automate,
        })

        await userEvent.click(screen.getByText('Select plan to get started'))
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
})
