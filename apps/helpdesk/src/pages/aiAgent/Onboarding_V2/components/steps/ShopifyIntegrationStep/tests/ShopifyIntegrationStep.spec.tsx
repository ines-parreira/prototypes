import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import type { StoreConfiguration } from 'models/aiAgent/types'
import type { StoreIntegration } from 'models/integration/types'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import { ShopifyIntegrationStep } from 'pages/aiAgent/Onboarding_V2/components/steps/ShopifyIntegrationStep/ShopifyIntegrationStep'
import { useCreateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useCreateOnboarding'
import { useGenerateToneOfVoice } from 'pages/aiAgent/Onboarding_V2/hooks/useGenerateToneOfVoice'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { useGetOnboardingDataByShopName } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingDataByShopName'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding_V2/hooks/useShopifyIntegrations'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

// Mock the useShopifyIntegrations hook
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useShopifyIntegrations')
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')
jest.mock('pages/aiAgent/hooks/useStoreConfigurationForAccount')

const mockUseShopifyIntegrations = useShopifyIntegrations as jest.Mock
const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock
const mockUseStoreConfigurationForAccount =
    useStoreConfigurationForAccount as jest.Mock

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingDataByShopName')
const useGetOnboardingDataByShopNameMock = assumeMock(
    useGetOnboardingDataByShopName,
)

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useUpdateOnboarding')
const useUpdateOnboardingMock = assumeMock(useUpdateOnboarding)

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useCreateOnboarding')
const useCreateOnboardingMock = assumeMock(useCreateOnboarding)

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGenerateToneOfVoice')
const useGenerateToneOfVoiceMock = assumeMock(useGenerateToneOfVoice)

const queryClient = new QueryClient()

const goToStep = jest.fn()
const setIsStoreSelected = jest.fn()

let history = createMemoryHistory()

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const renderComponent = (
    shopifyIntegrations: StoreIntegration[] = [],
    storeConfigurations: StoreConfiguration[] = [],
) => {
    mockUseShopifyIntegrations.mockReturnValue(shopifyIntegrations)
    mockUseStoreConfigurationForAccount.mockReturnValue({
        storeConfigurations,
        isLoading: false,
    })

    return renderWithRouter(
        <>
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <ShopifyIntegrationStep
                        currentStep={2}
                        totalSteps={3}
                        goToStep={goToStep}
                        setIsStoreSelected={setIsStoreSelected}
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

        useGetOnboardingDataMock.mockReturnValue({
            isLoading: false,
            data: undefined,
        })

        useGenerateToneOfVoiceMock.mockReturnValue({
            isLoading: false,
            generateToneOfVoice: jest
                .fn()
                .mockResolvedValue('Here is the tone of voice'),
        })

        useGetOnboardingDataByShopNameMock.mockReturnValue({
            isLoading: false,
            data: {
                id: '1',
                shopName: 'Test Store',
                salesPersuasionLevel: PersuasionLevel.Moderate,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesDiscountMax: 0.8,
                scopes: [],
                currentStepName: WizardStepEnum.CHANNELS,
            },
        } as any)

        useUpdateOnboardingMock.mockReturnValue({
            mutate: (data: any, { onSuccess }: { onSuccess: () => {} }) => {
                onSuccess()
            },
            isLoading: false,
        } as any)

        useCreateOnboardingMock.mockReturnValue({
            mutate: (data: any, { onSuccess }: { onSuccess: () => {} }) => {
                onSuccess()
            },
            isLoading: false,
        } as any)
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

    it('does not render the dropdown when there is no available integrations', () => {
        const integrations = [
            { id: 1, name: 'Test Store', type: 'shopify' },
            { id: 2, name: 'Test Store 1', type: 'shopify' },
        ] as StoreIntegration[]
        const storeConfigurations = [
            { storeName: 'Test Store', monitoredChatIntegrations: [] },
            { storeName: 'Test Store 1', monitoredChatIntegrations: [] },
        ] as unknown as StoreConfiguration[]

        renderComponent(integrations, storeConfigurations)
        expect(screen.queryByText('arrow_drop_down')).not.toBeInTheDocument()
        expect(
            screen.getByText(
                /All your stores have an Ai Agent configured already./,
            ),
        ).toBeInTheDocument()
    })

    it('renders the dropdown with available integrations', () => {
        const integrations = [
            { id: 1, name: 'Test Store', type: 'shopify' },
            { id: 2, name: 'Test Store 1', type: 'shopify' },
        ] as StoreIntegration[]
        const storeConfigurations = [
            { storeName: 'Test Store', monitoredChatIntegrations: [] },
        ] as unknown as StoreConfiguration[]

        renderComponent(integrations, storeConfigurations)
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

    it('navigates to the CHANNELS step when Next is clicked', async () => {
        const integrations = [
            { id: 1, name: 'Test Store', type: 'shopify' },
            { id: 2, name: 'Test Store 2', type: 'shopify' },
        ]
        renderComponent(integrations as StoreIntegration[])

        fireEvent.click(screen.getByText(/Next/i))

        await waitFor(() => {
            expect(setIsStoreSelected).toHaveBeenCalledWith(true)
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
