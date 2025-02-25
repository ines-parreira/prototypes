import { renderHook } from '@testing-library/react-hooks'

import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding/hooks/useShopifyIntegrations'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'

import { useSteps } from '../useSteps'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
jest.mock('pages/settings/contactForm/hooks/useEmailIntegrations')
jest.mock('pages/aiAgent/Onboarding/hooks/useShopifyIntegrations')
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseEmailIntegrations = useEmailIntegrations as jest.Mock
const mockUseShopifyIntegrations = useShopifyIntegrations as jest.Mock
const mockUseGetOnboardingData = useGetOnboardingData as jest.Mock

describe('useSteps', () => {
    it('should return all steps when no integrations exist and data is loading', () => {
        mockUseShopifyIntegrations.mockReturnValue([])
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: null,
            integrationId: null,
            needScopeUpdate: false,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: null,
            defaultIntegration: null,
        })
        mockUseGetOnboardingData.mockReturnValue({
            data: null,
            isLoading: true,
        })

        const { result } = renderHook(() => useSteps({ shopName: 'test-shop' }))

        expect(result.current.validSteps).toEqual([
            { step: WizardStepEnum.SKILLSET, condition: true },
            { step: WizardStepEnum.SHOPIFY_INTEGRATION, condition: true },
            { step: WizardStepEnum.EMAIL_INTEGRATION, condition: true },
            { step: WizardStepEnum.CHANNELS, condition: true },
            { step: WizardStepEnum.PERSONALITY_PREVIEW, condition: true },
            { step: WizardStepEnum.SALES_PERSONALITY, condition: true },
            { step: WizardStepEnum.HANDOVER, condition: true },
            { step: WizardStepEnum.KNOWLEDGE, condition: true },
        ])
        expect(result.current.totalSteps).toBe(8)
    })

    it('should exclude steps based on integration and email data', () => {
        mockUseShopifyIntegrations.mockReturnValue([])
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
            integrationId: 123,
            needScopeUpdate: false,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: [{}],
            defaultIntegration: {},
        })
        mockUseGetOnboardingData.mockReturnValue({
            data: { scopes: [] },
            isLoading: false,
        })

        const { result } = renderHook(() => useSteps({ shopName: 'test-shop' }))

        expect(result.current.validSteps).toEqual([
            { step: WizardStepEnum.SKILLSET, condition: true },
            { step: WizardStepEnum.CHANNELS, condition: true },
            { step: WizardStepEnum.PERSONALITY_PREVIEW, condition: true },
            { step: WizardStepEnum.HANDOVER, condition: true },
            { step: WizardStepEnum.KNOWLEDGE, condition: true },
        ])
        expect(result.current.totalSteps).toBe(5)
    })

    it('should include SALES_PERSONALITY step when AiAgentScopes.SALES is in data.scopes', () => {
        mockUseShopifyIntegrations.mockReturnValue([])
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
            integrationId: 123,
            needScopeUpdate: false,
        })
        mockUseEmailIntegrations.mockReturnValue({
            emailIntegrations: [{}],
            defaultIntegration: {},
        })
        mockUseGetOnboardingData.mockReturnValue({
            data: { scopes: [AiAgentScopes.SALES] },
            isLoading: false,
        })

        const { result } = renderHook(() => useSteps({ shopName: 'test-shop' }))

        expect(result.current.validSteps).toContainEqual({
            step: WizardStepEnum.SALES_PERSONALITY,
            condition: true,
        })
    })
})
