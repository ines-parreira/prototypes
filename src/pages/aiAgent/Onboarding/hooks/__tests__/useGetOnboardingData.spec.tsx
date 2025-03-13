import { renderHook } from '@testing-library/react-hooks'

import { shopifyIntegration } from 'fixtures/integrations'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { assumeMock } from 'utils/testing'

import {
    defaultOnboardingData,
    useGetOnboardingData,
} from '../useGetOnboardingData'
import { useGetOnboardings } from '../useGetOnboardings'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardings')
const useGetOnboardingsMock = assumeMock(useGetOnboardings)

const defaultOnboarding = {
    id: '1',
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.8,
    scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
    shopName: shopifyIntegration.meta.shop_name,
    currentStepName: WizardStepEnum.SKILLSET,
}

describe('useGetOnboardingData', () => {
    it('should return the onboarding by shop name', () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [
                { ...defaultOnboarding, shopName: 'another-shop' },
                defaultOnboarding,
            ],
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useGetOnboardingData(shopifyIntegration.meta.shop_name),
        )

        expect(result.current.isLoading).toEqual(false)
        expect(result.current.data).toEqual(defaultOnboarding)
    })
    it('should return ongoing onboarding', () => {
        const onboardingData = {
            ...defaultOnboarding,
            shopName: undefined,
        }
        useGetOnboardingsMock.mockReturnValue({
            data: [onboardingData],
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useGetOnboardingData())

        expect(result.current.isLoading).toEqual(false)
        expect(result.current.data).toEqual(onboardingData)
    })
    it('should return default onboarding', () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [],
            isLoading: false,
        } as any)

        const { result } = renderHook(() => useGetOnboardingData())

        expect(result.current.isLoading).toEqual(false)
        expect(result.current.data).toEqual(defaultOnboardingData)
    })
})
