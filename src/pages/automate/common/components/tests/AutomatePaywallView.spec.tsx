import React from 'react'
import {render, screen, fireEvent} from '@testing-library/react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {fromJS, Map} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {QueryClientProvider} from '@tanstack/react-query'
import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import AutomatePaywallView from 'pages/automate/common/components/AutomatePaywallView'
import {usePaywallConfig} from 'pages/automate/common/hooks/usePaywallConfig'
import {AutomateFeatures} from 'pages/automate/common/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {HTTP_INTEGRATION_TYPE} from 'constants/integration'
import {ticket} from 'fixtures/ticket'
import {AGENT_ROLE} from 'config/user'
import {user} from 'fixtures/users'
import {
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPlan,
    products,
} from 'fixtures/productPrices'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('common/segment')
jest.mock('../../hooks/usePaywallConfig')

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockUsePaywallConfig = usePaywallConfig as jest.MockedFunction<
    typeof usePaywallConfig
>
const defaultState = {
    currentUser: Map({
        id: Math.random() * 1000,
    }),
    integrations: fromJS({
        integrations: [{type: HTTP_INTEGRATION_TYPE}],
    }),
    ticket: fromJS(ticket),
}
const mockStore = configureMockStore()
const queryClient = mockQueryClient()
describe('AutomatePaywallView', () => {
    const paywallConfig = {
        headerTitle: 'Automate',
        paywallLogo: 'logo-url',
        paywallLogoAlt: 'logo-alt',
        paywallTitle: 'Automate Title',
        descriptions: ['Description 1', 'Description 2'],
        showRoiCalculator: true,
        slidesWidth: 500,
        slidesData: [
            {
                imageUrl: 'slide1.png',
                description: 'Slide 1',
            },
            {
                imageUrl: 'slide2.png',
                description: 'Slide 2',
            },
        ],
    }

    beforeEach(() => {
        mockUsePaywallConfig.mockReturnValue(paywallConfig)
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ObservabilityROICalculator]: true,
        })
    })

    const renderWithProvider = (ui: React.ReactElement) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            current_subscription: {
                                products: {
                                    [HELPDESK_PRODUCT_ID]:
                                        legacyBasicHelpdeskPlan.price_id,
                                },
                            },
                        }),
                        currentUser: fromJS({
                            ...user,
                            role: {name: AGENT_ROLE},
                        }),
                        billing: fromJS({products}),
                    })}
                >
                    {ui}
                </Provider>
            </QueryClientProvider>
        )
    }

    it('renders the component correctly', () => {
        renderWithProvider(
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )

        expect(screen.getByText('Automate')).toBeInTheDocument()
        expect(screen.getByAltText('logo-alt')).toBeInTheDocument()
        expect(screen.getByText('Automate Title')).toBeInTheDocument()
        expect(screen.getByText('Description 1')).toBeInTheDocument()
        expect(screen.getByText('Description 2')).toBeInTheDocument()
        expect(
            screen.getByText('Select plan to get started')
        ).toBeInTheDocument()
        expect(screen.getByText('Learn more')).toBeInTheDocument()
    })

    it('logs event on mount', () => {
        renderWithProvider(
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallVisited,
            {
                location: AutomateFeatures.Automate,
            }
        )
    })

    it('hide the header title when it is not provided', () => {
        mockUsePaywallConfig.mockReturnValue({
            ...paywallConfig,
            headerTitle: '',
        })

        renderWithProvider(
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )

        expect(screen.queryByText('Automate')).not.toBeInTheDocument()
    })

    it('hide the logo when it is not provided', () => {
        mockUsePaywallConfig.mockReturnValue({
            ...paywallConfig,
            paywallLogo: '',
        })

        renderWithProvider(
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )

        expect(screen.queryByAltText('logo-alt')).not.toBeInTheDocument()
    })

    it('hides the learn more button when "hideLearnMore" is true', () => {
        mockUsePaywallConfig.mockReturnValue({
            ...paywallConfig,
            hideLearnMore: true,
        })

        renderWithProvider(
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )
        expect(screen.queryByText('Learn more')).not.toBeInTheDocument()
    })

    it('displays a custom call to action when provided, instead of the default "Select plan to get started"', () => {
        mockUsePaywallConfig.mockReturnValue({
            ...paywallConfig,
            customCta: <div role="button">My custom call to Action</div>,
        })

        renderWithProvider(
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )

        expect(
            screen.getByRole('button', {name: 'My custom call to Action'})
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Select plan to get started')
        ).not.toBeInTheDocument()
    })

    it('displays ROI Calculator button when feature flag is enabled', () => {
        renderWithProvider(
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )

        expect(
            screen.getByText('Calculate Potential Return on Investment')
        ).toBeInTheDocument()
    })

    it('opens ROI Calculator modal on button click', () => {
        renderWithProvider(
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )

        fireEvent.click(
            screen.getByText('Calculate Potential Return on Investment')
        )
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not display ROI Calculator button when feature flag is disabled', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.ObservabilityROICalculator]: false,
        })
        renderWithProvider(
            <AutomatePaywallView automateFeature={AutomateFeatures.Automate} />
        )

        expect(
            screen.queryByText('Calculate Potential Return on Investment')
        ).not.toBeInTheDocument()
    })
})
