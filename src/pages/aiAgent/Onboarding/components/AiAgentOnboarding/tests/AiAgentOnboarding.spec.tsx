import {screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import LD from 'launchdarkly-react-client-sdk'
import React from 'react'

import '@testing-library/jest-dom/extend-expect'
import {FeatureFlagKey} from 'config/featureFlags'
import * as ContextModule from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

import {renderWithRouter} from 'utils/testing'

import {AiAgentOnboarding} from '../AiAgentOnboarding'

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

describe('AiAgentOnboarding', () => {
    beforeEach(() => {
        // Populate the return values of the mocked hooks
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: true,
            defaultIntegration: true,
        })
        jest.spyOn(ContextModule, 'useOnboardingContext').mockReturnValue({
            scope: [AiAgentScopes.SALES, AiAgentScopes.SUPPORT],
            lastStep: WizardStepEnum.SKILLSET,
            setOnboardingData: jest.fn(),
            getOnboardingData: jest.fn(),
        })
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvAiOnboarding]: true,
        }))
    })

    it('renders the Onboarding component', () => {
        renderWithRouter(<AiAgentOnboarding />)
        expect(screen.getByAltText('Gorgias')).toBeInTheDocument()
    })

    it('displays loading state correctly', () => {
        jest.spyOn(ContextModule, 'useOnboardingContext').mockReturnValue({
            scope: [AiAgentScopes.SALES, AiAgentScopes.SUPPORT],
            lastStep: WizardStepEnum.SKILLSET,
            setOnboardingData: jest.fn(),
            getOnboardingData: jest.fn(),
        })
        renderWithRouter(<AiAgentOnboarding />)
        expect(screen.getByAltText('Gorgias')).toBeInTheDocument()
    })

    it('should redirect to main page', () => {
        const history = createMemoryHistory()

        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvAiOnboarding]: false,
        }))

        renderWithRouter(<AiAgentOnboarding />, {
            history,
        })

        expect(history.location.pathname).toEqual(
            '/app/automation/shopify/undefined/ai-agent'
        )
    })
})
