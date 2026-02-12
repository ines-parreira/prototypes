import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import { HandoverStep } from 'pages/aiAgent/Onboarding_V2/components/steps/HandoverStep/HandoverStep'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useOnboardingIntegrationRedirection } from 'pages/aiAgent/Onboarding_V2/hooks/useOnboardingIntegrationRedirection'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useStandaloneIntegrationUpsert } from 'pages/standalone/hooks/useStandaloneIntegrationUpsert'
import { HelpdeskIntegrationOptions } from 'pages/standalone/types'
import { notify } from 'state/notifications/actions'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const mockDispatch = jest.fn()

jest.mock('services/socketManager')
jest.mock('state/notifications/actions')
const mockNotify = jest.fn()
jest.mocked(notify).mockImplementation(mockNotify)

// Mock tracking services
jest.mock('@repo/logging')
jest.mock('utils/gorgiasAppsAuth')

// Mock aiAgent queries
jest.mock('models/aiAgent/queries')
const mockUseGetStoresConfigurationForAccount = jest.fn().mockReturnValue({
    storeConfigurations: [],
    isLoading: false,
})
jest.mocked(useGetStoresConfigurationForAccount).mockImplementation(
    mockUseGetStoresConfigurationForAccount,
)

// Mocking the email integration
const mockEmailIntegration = {
    id: 123,
    type: 'email' as const,
    meta: {
        address: 'test@example.com',
    },
}

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [
            shopifyIntegration,
            ...chatIntegrationFixtures,
            mockEmailIntegration,
        ],
    }),
} as RootState

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding')
const mockUpdateOnboardingMutate = jest.fn()
const updateOnboardingMock = assumeMock(useUpdateOnboarding)

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useOnboardingIntegrationRedirection',
)
const mockRedirectToIntegration = jest.fn()
const mockUseOnboardingIntegrationRedirection = assumeMock(
    useOnboardingIntegrationRedirection,
)

jest.mock('pages/standalone/hooks/useStandaloneIntegrationUpsert')
const mockUpsert = jest.fn()
const mockUseStandaloneIntegrationUpsert = assumeMock(
    useStandaloneIntegrationUpsert,
)

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
const mockUseTrialAccess = assumeMock(useTrialAccess)

const mockGoToStep = jest.fn()

const history = createMemoryHistory({
    initialEntries: [
        `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/handover`,
    ],
})

const testQueryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const renderComponent = (isStoreSelected = true) => {
    const store = mockStore(defaultState)
    store.dispatch = mockDispatch

    renderWithRouter(
        <QueryClientProvider client={testQueryClient}>
            <Provider store={store}>
                <HandoverStep
                    currentStep={5}
                    totalSteps={6}
                    goToStep={mockGoToStep}
                    isStoreSelected={isStoreSelected}
                />
            </Provider>
        </QueryClientProvider>,
        {
            history,
            path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
            route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/handover`,
        },
    )
}

describe('HandoverStep', () => {
    const defaultOnboardingData = {
        id: '1',
        salesPersuasionLevel: PersuasionLevel.Moderate,
        salesDiscountStrategyLevel: DiscountStrategy.Balanced,
        salesDiscountMax: 0.8,
        scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
        shopName: shopifyIntegration.meta.shop_name,
        currentStepName: WizardStepEnum.HANDOVER,
        handoverMethod: 'email',
        handoverEmail: 'test@example.com',
        handoverEmailIntegrationId: 123,
        handoverHttpIntegrationId: 456,
    }
    beforeEach(() => {
        jest.clearAllMocks()
        testQueryClient.clear()

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: { ...defaultOnboardingData },
        })

        updateOnboardingMock.mockReturnValue({
            mutate: mockUpdateOnboardingMutate,
            isLoading: false,
        } as any)

        mockUseOnboardingIntegrationRedirection.mockReturnValue({
            redirectToIntegration: mockRedirectToIntegration,
            redirectToOnboardingIfOnboarding: jest.fn(),
            integrationId: '',
            integrationType: 'email',
        })

        mockUseStandaloneIntegrationUpsert.mockReturnValue({
            upsert: mockUpsert,
            currentIntegrationType: HelpdeskIntegrationOptions.ZENDESK,
        })

        mockUseTrialAccess.mockReturnValue(createMockTrialAccess())
    })

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should render handover step with title and options', () => {
        renderComponent()

        jest.runAllTimers()

        expect(
            screen.getByText(/Next, how do you want to manage/i),
        ).toBeInTheDocument()
        expect(screen.getByText(/handovers\?/i)).toBeInTheDocument()

        // Check radio buttons
        expect(screen.getByText('Email')).toBeInTheDocument()
        expect(screen.getByText('Gorgias')).toBeInTheDocument()
        expect(screen.getByText('Webhook')).toBeInTheDocument()

        // Verify recommended badge is present
        expect(screen.getByText('Recommended')).toBeInTheDocument()
    })

    it('should have email option selected by default', () => {
        renderComponent()
        jest.runAllTimers()

        // Email should be selected by default
        const emailCard = screen
            .getByText(
                'Conversations that need human intervention will be sent to this email address.',
            )
            .closest('.card') // Using the class from HandoverCard

        // Look for the radio button inside the email card
        const radioButton = emailCard?.querySelector('input[type="radio"]')
        expect(radioButton).toBeChecked()
    })

    it('should switch between handover methods when selected', async () => {
        renderComponent()
        jest.runAllTimers()

        // Initially email should be selected
        expect(
            screen.getByText(
                'Conversations that need human intervention will be sent to this email address.',
            ),
        ).toBeInTheDocument()

        // Switch to webhook
        await act(async () => {
            const webhookRadio = screen.getAllByText('Webhook')[0]
            fireEvent.click(webhookRadio)
        })

        // Should show webhook fields
        expect(
            screen.getByText(/Select a third-party integration/i),
        ).toBeInTheDocument()

        // Switch to Gorgias
        await act(async () => {
            const gorgiasRadio = screen.getAllByText('Gorgias')[0]
            fireEvent.click(gorgiasRadio)
        })

        // No additional fields for Gorgias
        expect(
            screen.queryByText(/Select a third-party integration/i),
        ).not.toBeInTheDocument()
    })

    it('submits email handover configuration when Next is clicked', async () => {
        renderComponent()
        jest.runAllTimers()

        // Email is selected by default
        await act(async () => {
            fireEvent.click(screen.getByText('Next'))
        })

        expect(mockUpdateOnboardingMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    handoverMethod: 'email',
                    handoverEmail: 'test@example.com',
                    handoverEmailIntegrationId: 123,
                    handoverHttpIntegrationId: 456,
                }),
            }),
            expect.anything(),
        )
    })

    it('submits webhook handover configuration when Next is clicked', async () => {
        renderComponent()
        jest.runAllTimers()

        // Switch to webhook
        await act(async () => {
            const webhookRadio = screen.getAllByText('Webhook')[0]
            fireEvent.click(webhookRadio)
        })

        waitFor(() => {
            expect(
                screen.getByLabelText(/Basic Auth Token/),
            ).toBeInTheDocument()
            expect(screen.getByLabelText(/Subdomain/)).toBeInTheDocument()
        })

        await act(async () => {
            const subdomainField = screen.getByLabelText(/Subdomain/)
            fireEvent.change(subdomainField, { target: { value: 'Foo' } })
        })

        await act(async () => {
            const basicTokenField = screen.getByLabelText(/Basic Auth Token/)
            fireEvent.change(basicTokenField, { target: { value: 'Foo' } })
        })

        await act(async () => {
            fireEvent.click(screen.getByText('Next'))
        })

        expect(mockUpsert).toHaveBeenCalledWith(
            HelpdeskIntegrationOptions.ZENDESK,
        )
    })

    it('navigates to the previous step when Back is clicked', async () => {
        renderComponent()
        jest.runAllTimers()

        await act(async () => {
            fireEvent.click(screen.getByText('Back'))
        })

        expect(mockGoToStep).toHaveBeenCalled()
    })

    it('redirects to integration page when email integration CTA is clicked', async () => {
        renderComponent()
        jest.runAllTimers()

        // Look for the "Don't see the email you want? Click here" link
        const connectEmailLink = screen.getByText(
            /Don't see the email you want\? Click here/i,
        )
        await act(async () => {
            fireEvent.click(connectEmailLink)
        })

        expect(mockRedirectToIntegration).toHaveBeenCalled()
    })

    it('displays error notification when onboarding data is missing', async () => {
        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            // payload without id.
            data: {
                currentStepName: 'handover',
                handoverEmail: 'test@example.com',
                handoverEmailIntegrationId: 123,
                handoverMethod: 'email',
                handoverHttpIntegrationId: 456,
                salesDiscountMax: 0.8,
                salesDiscountStrategyLevel: 'balanced' as DiscountStrategy,
                salesPersuasionLevel: 'balanced' as PersuasionLevel,
                scopes: ['support', 'sales'] as AiAgentScopes[],
                shopName: 'shopify-store',
            },
        })

        renderComponent()

        await act(async () => {
            fireEvent.click(screen.getByText('Next'))
        })

        expect(mockUpdateOnboardingMutate).not.toHaveBeenCalled()
    })

    it('handles integration creation success correctly', async () => {
        const countController = { number: 0 }
        mockUseStandaloneIntegrationUpsert.mockImplementation(
            (_, __, onSuccess) => {
                if (countController.number > 0) {
                    // We don't want to cause infinit rendering
                    return {
                        upsert: () => {},
                        currentIntegrationType:
                            HelpdeskIntegrationOptions.INTERCOM,
                    }
                }
                onSuccess(999)
                countController.number += 1

                return {
                    upsert: () => {},
                    currentIntegrationType: HelpdeskIntegrationOptions.INTERCOM,
                }
            },
        )

        // expect it to render without crashing
        renderComponent()
    })

    it('updates webhookThirdParty and webhookRequiredFields when onWebhookClick is called', async () => {
        renderComponent()

        const webhookBtn = screen.getByText('Webhook')
        fireEvent.click(webhookBtn)

        await waitFor(() => {
            expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('arrow_drop_down'))

        await waitFor(() => {
            expect(screen.getAllByText('Zendesk')[0]).toBeInTheDocument()
        })

        fireEvent.click(screen.getAllByText('Zendesk')[0])

        waitFor(() => {
            expect(screen.getAllByText('Zendesk')[0]).toBeInTheDocument()
        })
    })

    it('does not show email dropdown when there is a base email integration and uses base email ID on submission', async () => {
        const baseEmailIntegrationId = 999

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: {
                ...defaultOnboardingData,
                handoverEmailIntegrationId: baseEmailIntegrationId,
            },
        })

        const forwardingDomain = 'emails-test.gorgi.us'
        ;(window as any).GORGIAS_STATE = {
            integrations: {
                authentication: {
                    email: {
                        forwarding_email_address: `forwarding@${forwardingDomain}`,
                    },
                },
            },
        }

        const baseEmailIntegration = {
            id: baseEmailIntegrationId,
            type: 'email' as const,
            meta: {
                address: `random-string@${forwardingDomain}`,
                verified: true,
            },
        }

        const stateWithBaseEmail = {
            ...defaultState,
            integrations: (
                fromJS(integrationsState) as Map<any, any>
            ).mergeDeep({
                integrations: [
                    shopifyIntegration,
                    ...chatIntegrationFixtures,
                    baseEmailIntegration,
                ],
            }),
        } as RootState

        const renderComponentWithBaseEmail = () => {
            const store = mockStore(stateWithBaseEmail)
            store.dispatch = mockDispatch

            renderWithRouter(
                <QueryClientProvider client={testQueryClient}>
                    <Provider store={store}>
                        <HandoverStep
                            currentStep={5}
                            totalSteps={6}
                            goToStep={mockGoToStep}
                            isStoreSelected={true}
                        />
                    </Provider>
                </QueryClientProvider>,
                {
                    history,
                    path: '/app/ai-agent/:shopType/:shopName/onboarding/:step',
                    route: `/app/ai-agent/shopify/${shopifyIntegration.meta.shop_name}/onboarding/handover`,
                },
            )
        }

        renderComponentWithBaseEmail()
        jest.runAllTimers()

        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Email from which handover emails will be sent',
                ),
            ).not.toBeInTheDocument()
        })

        await waitFor(() => {
            const emailInput = screen.getByLabelText(
                /Email that will receive handover conversations/,
            )
            expect(emailInput).toBeInTheDocument()
        })

        const emailInput = screen.getByLabelText(
            /Email that will receive handover conversations/,
        )

        fireEvent.change(emailInput, {
            target: { value: 'recipient@example.com' },
        })

        await act(async () => {
            fireEvent.click(screen.getByText('Next'))
        })

        expect(mockUpdateOnboardingMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    handoverMethod: 'email',
                    handoverEmail: 'recipient@example.com',
                    handoverEmailIntegrationId: baseEmailIntegrationId,
                    handoverHttpIntegrationId: expect.anything(),
                }),
            }),
            expect.anything(),
        )

        delete (window as any).GORGIAS_STATE
    })

    it('should change toggle to the clicked card when clicking on the card', async () => {
        renderComponent()
        jest.runAllTimers()

        const emailCard = screen
            .getByText(
                'Conversations that need human intervention will be sent to this email address.',
            )
            .closest('.card')
        const emailRadio = emailCard?.querySelector('input[type="radio"]')
        expect(emailRadio).toBeChecked()

        const webhookCard = screen
            .getByText(
                'Conversations that need human intervention will use this webhook to send handover conversations to the tool of your choice.',
            )
            .closest('.card')

        await act(async () => {
            fireEvent.click(webhookCard!)
        })

        const webhookRadio = webhookCard?.querySelector('input[type="radio"]')
        expect(webhookRadio).toBeChecked()
        expect(emailRadio).not.toBeChecked()

        const gorgiasCard = screen
            .getByText(
                'Conversations that need human intervention will be sent to handover tickets within Gorgias.',
            )
            .closest('.card')

        await act(async () => {
            fireEvent.click(gorgiasCard!)
        })

        const gorgiasRadio = gorgiasCard?.querySelector('input[type="radio"]')
        expect(gorgiasRadio).toBeChecked()
        expect(webhookRadio).not.toBeChecked()
        expect(emailRadio).not.toBeChecked()
    })
})
