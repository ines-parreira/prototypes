import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import {
    createOnboardingData,
    getOnboardingData,
    getOnboardingDataByShopName,
    updateOnboardingData,
} from 'models/aiAgent/resources/configuration'

import '@testing-library/jest-dom/extend-expect'

import { StoreIntegration } from 'models/integration/types'
import { ShopifyIntegrationStep } from 'pages/aiAgent/Onboarding/components/steps/ShopifyIntegrationStep/ShopifyIntegrationStep'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding/hooks/useShopifyIntegrations'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

// Mock the useShopifyIntegrations hook
jest.mock('pages/aiAgent/Onboarding/hooks/useShopifyIntegrations')
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

jest.mock('models/aiAgent/resources/configuration', () => ({
    getOnboardingData: jest.fn(),
    getOnboardingDataByShopName: jest.fn(),
    createOnboardingData: jest.fn(),
    updateOnboardingData: jest.fn(),
}))

const mockGetOnboardingData = getOnboardingData as jest.Mock
const mockGetOnboardingDataByShopName = getOnboardingDataByShopName as jest.Mock
const mockCreateOnboardingData = createOnboardingData as jest.Mock
const mockUpdateOnboardingData = updateOnboardingData as jest.Mock

const mockUseShopifyIntegrations = useShopifyIntegrations as jest.Mock
const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock

const queryClient = new QueryClient()

const goToStep = jest.fn()

let history = createMemoryHistory()

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const renderComponent = (shopifyIntegrations: StoreIntegration[] = []) => {
    mockUseShopifyIntegrations.mockReturnValue(shopifyIntegrations)
    return renderWithRouter(
        <>
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <ShopifyIntegrationStep
                        currentStep={2}
                        totalSteps={3}
                        goToStep={goToStep}
                    />
                </Provider>
            </QueryClientProvider>
        </>,
        { history },
    )
}

describe('ShopifyIntegrationStep', () => {
    beforeEach(() => {
        history = createMemoryHistory()

        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })

        // ✅ Mock getOnboardingData function
        mockGetOnboardingData.mockResolvedValue(Promise.resolve([]))

        // ✅ Mock getOnboardingDataByShopName function
        mockGetOnboardingDataByShopName.mockResolvedValue(
            Promise.resolve([
                {
                    id: '1',
                    shopName: 'Test Store',
                    currentStepName: 'CHANNELS',
                },
                {
                    id: '2',
                    shopName: 'Test Store 1',
                    currentStepName: 'CHANNELS',
                },
                {
                    id: '3',
                    shopName: 'Test Store 2',
                    currentStepName: 'CHANNELS',
                },
            ]),
        )

        // ✅ Mock createOnboardingData function
        mockCreateOnboardingData.mockResolvedValue(
            Promise.resolve({
                id: '456',
                shopName: 'New Test Store',
                currentStepName: 'CHANNELS',
            }),
        )

        // // ✅ Mock updateOnboardingData function
        mockUpdateOnboardingData.mockResolvedValue(
            Promise.resolve({
                success: true,
            }),
        )
    })

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('renders without crashing', async () => {
        renderComponent()

        jest.runAllTimers()

        await waitFor(() => {
            expect(screen.getByText('Connect Shopify')).toBeInTheDocument()
        })
    })

    it('displays connected status when an integration is selected', async () => {
        const integrations = [{ id: 1, name: 'Test Store', type: 'shopify' }]
        renderComponent(integrations as StoreIntegration[])

        await waitFor(() => {
            expect(
                screen.getByText(
                    "You're already connected to Shopify. Click next to proceed.",
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('Connected')).toBeInTheDocument()
        })
    })

    it('displays disconnected status when no integration is selected', () => {
        renderComponent()

        expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })

    it('calls setOnboardingData with the selected integration name', () => {
        const integrations = [{ id: 1, name: 'Test Store', type: 'shopify' }]
        renderComponent(integrations as StoreIntegration[])

        // Check that the dropdown selector reflects the chosen store
        expect(screen.getByText('Test Store')).toBeInTheDocument()
    })

    it('opens Shopify URL when Connect button is clicked', () => {
        const originalOpen = window.open
        window.open = jest.fn()
        renderComponent()

        fireEvent.click(screen.getByText('Connect'))
        expect(window.open).toHaveBeenCalledWith(
            'https://apps.shopify.com/helpdesk',
            '_self',
        )
        window.open = originalOpen
    })

    it('opens Shopify URL when "Need to create a new store?" link is clicked', () => {
        const originalOpen = window.open
        window.open = jest.fn()
        const integrations = [{ id: 1, name: 'Test Store', type: 'shopify' }]
        renderComponent(integrations as StoreIntegration[])
        fireEvent.click(
            screen.getByText('Need to create a new store? Click here'),
        )
        expect(window.open).toHaveBeenCalledWith(
            'https://apps.shopify.com/helpdesk',
            '_self',
        )
        window.open = originalOpen
    })

    it('renders the dropdown when there are integrations', () => {
        const integrations = [{ id: 1, name: 'Test Store', type: 'shopify' }]
        renderComponent(integrations as StoreIntegration[])
        expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
    })

    it('renders the "Connect to Shopify" button when there are no integrations', () => {
        renderComponent()
        expect(screen.getByText('Connect')).toBeInTheDocument()
    })

    it('renders the AI banner when the status is connected', () => {
        const integrations = [{ id: 1, name: 'Test Store', type: 'shopify' }]
        renderComponent(integrations as StoreIntegration[])
        expect(
            screen.getByText(
                "You're already connected to Shopify. Click next to proceed.",
            ),
        ).toBeInTheDocument()
    })

    it('renders the AI banner with alternative text when there are multiple integrations', () => {
        const integrations = [
            { id: 1, name: 'Test Store', type: 'shopify' },
            { id: 2, name: 'Test Store 2', type: 'shopify' },
        ]
        renderComponent(integrations as StoreIntegration[])
        expect(
            screen.getByText(
                "You're already connected to Shopify. Select your store to proceed.",
            ),
        ).toBeInTheDocument()
    })

    it('navigates to the SKILLSET step when Back is clicked', async () => {
        const integrations = [
            { id: 1, name: 'Test Store', type: 'shopify' },
            { id: 2, name: 'Test Store 2', type: 'shopify' },
        ]
        renderComponent(integrations as StoreIntegration[])

        fireEvent.click(screen.getByText(/Back/i))

        await waitFor(() => {
            expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.SKILLSET)
        })
    })

    it('navigates to the CHANNELS step when Next is clicked', async () => {
        const integrations = [
            { id: 1, name: 'Test Store', type: 'shopify' },
            { id: 2, name: 'Test Store 2', type: 'shopify' },
        ]
        renderComponent(integrations as StoreIntegration[])

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(history.location.pathname).toEqual(
                `/app/ai-agent/shopify/${integrations[0].name}/onboarding/${WizardStepEnum.CHANNELS}`,
            )
        })
    })

    it('navigates to the EMAIL INTEGRATION step when Next is clicked and there are no email integrations', async () => {
        const integrations = [
            { id: 1, name: 'Test Store', type: 'shopify' },
            { id: 2, name: 'Test Store 2', type: 'shopify' },
        ]
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: false,
            defaultIntegration: false,
        })

        renderComponent(integrations as StoreIntegration[])

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(history.location.pathname).toEqual(
                `/app/ai-agent/shopify/${integrations[0].name}/onboarding/${WizardStepEnum.EMAIL_INTEGRATION}`,
            )
        })
    })

    it('updates text when another integration is selected', async () => {
        const integrations = [
            { id: 1, name: 'Test Store 1' },
            { id: 2, name: 'Test Store 2' },
        ]
        renderComponent(integrations as StoreIntegration[])

        await waitFor(() => {
            expect(screen.getByText('Test Store 1')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('Test Store 1'))
        fireEvent.click(screen.getByText('Test Store 2'))

        await waitFor(() => {
            expect(screen.getByText(integrations[1].name)).toBeInTheDocument()
        })
    })

    it('shows error message when Next is clicked and there is no integrations', async () => {
        renderComponent()

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(
                screen.getByText(
                    'No Shopify store connected. Please connect a store before proceeding.',
                ),
            ).toBeInTheDocument()
        })
    })
})
