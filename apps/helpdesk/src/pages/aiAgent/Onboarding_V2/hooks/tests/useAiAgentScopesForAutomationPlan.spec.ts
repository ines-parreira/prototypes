import { useLocalStorage } from '@repo/hooks'
import { assumeMock, renderHook } from '@repo/testing'

import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding_V2/types'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
const useCanUseAiSalesAgentMock = assumeMock(useCanUseAiSalesAgent)

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
const useTrialAccessMock = assumeMock(useTrialAccess)

jest.mock('@repo/hooks')
const useLocalStorageMock = assumeMock(useLocalStorage)

describe('useAiAgentScopesForAutomationPlan', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when canUseAiSalesAgent is true', () => {
        it('should return Sales+Support', () => {
            useCanUseAiSalesAgentMock.mockReturnValue(true)
            useTrialAccessMock.mockReturnValue(createMockTrialAccess())
            useLocalStorageMock.mockReturnValue([false, jest.fn(), jest.fn()])

            const { result } = renderHook(() =>
                useAiAgentScopesForAutomationPlan(),
            )

            expect(result.current).toEqual([
                AiAgentScopes.SUPPORT,
                AiAgentScopes.SALES,
            ])
        })
    })

    describe('when canUseAiSalesAgent is false', () => {
        beforeEach(() => {
            useCanUseAiSalesAgentMock.mockReturnValue(false)
        })

        it('should return Support only when no trial conditions are met', () => {
            useTrialAccessMock.mockReturnValue(createMockTrialAccess())
            useLocalStorageMock.mockReturnValue([false, jest.fn(), jest.fn()])

            const { result } = renderHook(() =>
                useAiAgentScopesForAutomationPlan(),
            )

            expect(result.current).toEqual([AiAgentScopes.SUPPORT])
        })

        describe('isOptedInForShoppingAssistantTrial conditions', () => {
            const testCases = [
                {
                    description: 'all conditions are met',
                    shopName: 'test-shop',
                    shoppingAssistantTrialOptin: true,
                    trialType: TrialType.ShoppingAssistant,
                    isOnboarded: false,
                    expectedScopes: [
                        AiAgentScopes.SUPPORT,
                        AiAgentScopes.SALES,
                    ],
                },
                {
                    description: 'shopName is undefined',
                    shopName: undefined,
                    shoppingAssistantTrialOptin: true,
                    trialType: TrialType.ShoppingAssistant,
                    isOnboarded: false,
                    expectedScopes: [AiAgentScopes.SUPPORT],
                },
                {
                    description: 'shopName is empty string',
                    shopName: '',
                    shoppingAssistantTrialOptin: true,
                    trialType: TrialType.ShoppingAssistant,
                    isOnboarded: false,
                    expectedScopes: [AiAgentScopes.SUPPORT],
                },
                {
                    description: 'shoppingAssistantTrialOptin is false',
                    shopName: 'test-shop',
                    shoppingAssistantTrialOptin: false,
                    trialType: TrialType.ShoppingAssistant,
                    isOnboarded: false,
                    expectedScopes: [AiAgentScopes.SUPPORT],
                },
                {
                    description:
                        'trialType is AiAgent instead of ShoppingAssistant',
                    shopName: 'test-shop',
                    shoppingAssistantTrialOptin: true,
                    trialType: TrialType.AiAgent,
                    isOnboarded: false,
                    expectedScopes: [AiAgentScopes.SUPPORT],
                },
                {
                    description: 'isOnboarded is true',
                    shopName: 'test-shop',
                    shoppingAssistantTrialOptin: true,
                    trialType: TrialType.ShoppingAssistant,
                    isOnboarded: true,
                    expectedScopes: [AiAgentScopes.SUPPORT],
                },
                {
                    description: 'multiple conditions are false',
                    shopName: undefined,
                    shoppingAssistantTrialOptin: false,
                    trialType: TrialType.AiAgent,
                    isOnboarded: true,
                    expectedScopes: [AiAgentScopes.SUPPORT],
                },
            ]

            it.each(testCases)(
                'should return $expectedScopes when $description',
                ({
                    shopName,
                    shoppingAssistantTrialOptin,
                    trialType,
                    isOnboarded,
                    expectedScopes,
                }) => {
                    useLocalStorageMock.mockReturnValue([
                        shoppingAssistantTrialOptin,
                        jest.fn(),
                        jest.fn(),
                    ])
                    useTrialAccessMock.mockReturnValue(
                        createMockTrialAccess({
                            trialType,
                            isOnboarded,
                        }),
                    )

                    const { result } = renderHook(() =>
                        useAiAgentScopesForAutomationPlan(shopName),
                    )

                    expect(result.current).toEqual(expectedScopes)
                },
            )
        })
    })
})
