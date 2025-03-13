import { waitFor } from '@testing-library/react'

import { shopifyIntegration } from 'fixtures/integrations'
import { getOnboardingData } from 'models/aiAgent/resources/configuration'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { assumeMock } from 'utils/testing'

import { useGetOnboardings } from '../useGetOnboardings'

jest.mock('models/aiAgent/resources/configuration')
const getOnboardingDataMock = assumeMock(getOnboardingData)

const defaultOnboarding = {
    id: '1',
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.8,
    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
    shopName: shopifyIntegration.meta.shop_name,
    currentStepName: WizardStepEnum.SKILLSET,
}

describe('useGetOnboardings', () => {
    it('should return the onboardings', async () => {
        getOnboardingDataMock.mockResolvedValue([defaultOnboarding])

        const { result } =
            renderHookWithStoreAndQueryClientProvider(useGetOnboardings)

        await waitFor(() => {
            expect(result.current.isLoading).toEqual(false)
            expect(result.current.data).toEqual([defaultOnboarding])
        })
    })
})
