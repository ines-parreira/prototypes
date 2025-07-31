import { renderHook } from '@repo/testing'

import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding/hooks/useAiAgentScopesForAutomationPlan'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { assumeMock } from 'utils/testing'

import {
    defaultOnboardingData,
    useGetOnboardingData,
} from '../useGetOnboardingData'
import { useGetOnboardings } from '../useGetOnboardings'

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardings')
const useGetOnboardingsMock = assumeMock(useGetOnboardings)

const onboardingShop1 = {
    id: '1',
    salesPersuasionLevel: PersuasionLevel.Moderate,
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesDiscountMax: 0.8,
    scopes: [AiAgentScopes.SUPPORT],
    shopName: 'shop1',
    currentStepName: WizardStepEnum.SHOPIFY_INTEGRATION,
}

const onboardingShop2 = {
    ...onboardingShop1,
    id: '2',
    shopName: 'shop2',
}

const onboardingNoShop = {
    ...onboardingShop1,
    id: undefined,
    shopName: undefined,
}

jest.mock('pages/aiAgent/Onboarding/hooks/useAiAgentScopesForAutomationPlan')
const useAiAgentScopesForAutomationPlanMock = assumeMock(
    useAiAgentScopesForAutomationPlan,
)

describe('useGetOnboardingData', () => {
    beforeEach(() => {
        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ])
    })

    it('should return the onboarding by shop name', () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [onboardingShop1, onboardingShop2, onboardingNoShop],
            isLoading: false,
            isFetching: false,
        } as any)

        const { result } = renderHook(() =>
            useGetOnboardingData(onboardingShop1.shopName),
        )

        expect(result.current.isLoading).toEqual(false)
        expect(result.current.data).toEqual(onboardingShop1)
    })

    it('should return ongoing onboarding', () => {
        useGetOnboardingsMock.mockReturnValue({
            data: [onboardingShop1, onboardingShop2, onboardingNoShop],
            isLoading: false,
            isFetching: false,
        } as any)

        const { result } = renderHook(() => useGetOnboardingData())

        expect(result.current.isLoading).toEqual(false)
        expect(result.current.data).toEqual(onboardingNoShop)
    })

    it.each([
        {
            description: 'support + sales',
            scopes: [AiAgentScopes.SUPPORT, AiAgentScopes.SALES],
        },
        {
            description: 'support',
            scopes: [AiAgentScopes.SUPPORT],
        },
    ])(
        'should return default onboarding with scope $description',
        ({ scopes }) => {
            useAiAgentScopesForAutomationPlanMock.mockReturnValue(scopes)
            useGetOnboardingsMock.mockReturnValue({
                data: [],
                isLoading: false,
                isFetching: false,
            } as any)

            const { result } = renderHook(() => useGetOnboardingData())

            expect(result.current.isLoading).toEqual(false)
            expect(result.current.data).toEqual(defaultOnboardingData(scopes))
        },
    )
})
