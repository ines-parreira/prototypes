import '@testing-library/jest-dom/extend-expect'

import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { chatIntegrationFixtures } from 'fixtures/chat'
import { integrationsState, shopifyIntegration } from 'fixtures/integrations'
import { StoreIntegration } from 'models/integration/types'
import { StatusEnum } from 'pages/aiAgent/Onboarding/components/StatusBadge'
import { EmailIntegrationStep } from 'pages/aiAgent/Onboarding/components/steps/EmailIntegrationStep/EmailIntegrationStep'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding/hooks/useShopifyIntegrations'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

jest.mock('pages/aiAgent/Onboarding/hooks/useShopifyIntegrations')
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: (fromJS(integrationsState) as Map<any, any>).mergeDeep({
        integrations: [shopifyIntegration, ...chatIntegrationFixtures],
    }),
} as RootState

const mockUseShopifyIntegrations = useShopifyIntegrations as jest.Mock
const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock

const mockGoToStep = jest.fn()

const queryClient = new QueryClient()

const defaultProps = {
    currentStep: 2,
    totalSteps: 6,
    goToStep: mockGoToStep,
}

const defaultTitle = 'Now, let’s connect'

const renderComponent = (
    props = defaultProps,
    shopifyIntegrations: StoreIntegration[] = [],
) => {
    mockUseShopifyIntegrations.mockReturnValue(shopifyIntegrations)

    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>
                <EmailIntegrationStep {...props} />
            </Provider>
        </QueryClientProvider>,
    )
}

describe('EmailIntegrationStep', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })
    })

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should render without crashing', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText(defaultTitle)).toBeInTheDocument()
    })

    it('navigates to the personality preview step when Next is clicked', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText(defaultTitle)).toBeInTheDocument()

        fireEvent.click(screen.getByText(/Next/i))

        expect(mockGoToStep).toHaveBeenCalledWith(
            WizardStepEnum.PERSONALITY_PREVIEW,
        )
    })

    it('navigates back to Shopify Integration if integration is missing', () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: false,
        })
        renderComponent({ ...defaultProps, currentStep: 3 })

        jest.runAllTimers()

        expect(screen.getByText(defaultTitle)).toBeInTheDocument()

        fireEvent.click(screen.getByText(/Back/i))
        expect(mockGoToStep).toHaveBeenCalledWith(
            WizardStepEnum.SHOPIFY_INTEGRATION,
        )
    })

    it('navigates back to Skillset if integration exists', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText(defaultTitle)).toBeInTheDocument()

        fireEvent.click(screen.getByText(/Back/i))
        expect(mockGoToStep).toHaveBeenCalledWith(WizardStepEnum.SKILLSET)
    })

    it('should show connected when the integrations are defined', () => {
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
            gmailIntegration: {},
            microsoftIntegration: {},
        })

        renderComponent()

        jest.runAllTimers()

        expect(screen.getAllByText(StatusEnum.Connected).length).toBe(2)
    })

    it('should show disconnected when the integrations are undefined', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getAllByText(StatusEnum.Disconnected).length).toBe(2)
    })

    it('should call redirectToIntegration with the correct URI when clicked', () => {
        const mockRedirectToIntegration = jest.fn()
        const mockGmailRedirectUri = 'https://example.com/gmail/auth'
        const mockEvent = {
            preventDefault: jest.fn(),
        } as unknown as React.MouseEvent

        const handleSubmit = (e: React.MouseEvent, redirectUri: string) => {
            e.preventDefault()
            mockRedirectToIntegration(redirectUri)
        }
        handleSubmit(mockEvent, mockGmailRedirectUri)

        expect(mockEvent.preventDefault).toHaveBeenCalled()
        expect(mockRedirectToIntegration).toHaveBeenCalledWith(
            mockGmailRedirectUri,
        )
    })
})
