import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {screen, fireEvent, act} from '@testing-library/react'

import React from 'react'

import {SkillsetStep} from 'pages/aiAgent/Onboarding/components/steps/SkillsetStep/SkillsetStep'
import {WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

import {renderWithRouter} from 'utils/testing'

// Mock the hooks
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview',
    () => ({
        __esModule: true,
        default: ({children}: {children: React.ReactNode}) => (
            <div>{children}</div>
        ),
    })
)

jest.mock(
    'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation',
    () => ({
        __esModule: true,
        default: () => <div>AI Agent Preview</div>,
    })
)

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock

const queryClient = new QueryClient()

const goToStep = jest.fn()

const renderComponent = () => {
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <SkillsetStep currentStep={1} totalSteps={3} goToStep={goToStep} />
        </QueryClientProvider>
    )
}

describe('<SkillsetStep />', () => {
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

    it('renders', () => {
        renderComponent()

        jest.runAllTimers()

        expect(
            screen.getByText('Welcome to Conversational AI')
        ).toBeInTheDocument()
    })

    it('user can select a goal and click next when there is an integration', () => {
        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Automate support with AI')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))
        expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.CHANNELS)
    })

    it('user can select a goal and click next when there is not an integration', () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: false,
        })

        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Automate support with AI')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))
        expect(goToStep).toHaveBeenCalledWith(
            WizardStepEnum.SHOPIFY_INTEGRATION
        )
    })

    it('user can select a goal and click next when there is no email integration', () => {
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: false,
            defaultIntegration: false,
        })

        renderComponent()

        jest.runAllTimers()

        expect(screen.getByText('Automate support with AI')).toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('Automate support with AI'))
        })

        fireEvent.click(screen.getByText(/Next/i))
        expect(goToStep).toHaveBeenCalledWith(WizardStepEnum.EMAIL_INTEGRATION)
    })
})
