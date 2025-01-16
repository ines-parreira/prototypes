import {render, screen} from '@testing-library/react'
import React from 'react'

import '@testing-library/jest-dom/extend-expect'
import * as ContextModule from 'pages/aiAgent/Onboarding/providers/OnboardingContext'
import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'

import {Onboarding} from '../Onboarding'

// Mock the hooks
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock

describe('Onboarding', () => {
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
            last_user_step: WizardStepEnum.SKILLSET,
            setOnboardingData: jest.fn(),
        })
    })

    it('renders the Onboarding component', () => {
        render(<Onboarding shopName="testShop" />)
        expect(screen.getByAltText('Gorgias')).toBeInTheDocument()
    })

    it('displays loading state correctly', () => {
        jest.spyOn(ContextModule, 'useOnboardingContext').mockReturnValue({
            scope: [AiAgentScopes.SALES, AiAgentScopes.SUPPORT],
            last_user_step: WizardStepEnum.SKILLSET,
            setOnboardingData: jest.fn(),
        })
        render(<Onboarding shopName="testShop" />)
        expect(screen.getByAltText('Gorgias')).toBeInTheDocument()
    })
})
