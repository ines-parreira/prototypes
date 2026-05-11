import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { products } from 'fixtures/plans'
import { useAiAgentScopesForAutomationPlan } from 'pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan'
import { useShopifyIntegrations } from 'pages/aiAgent/Onboarding_V2/hooks/useShopifyIntegrations'
import {
    AiAgentScopes,
    WizardStepEnum,
} from 'pages/aiAgent/Onboarding_V2/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import type { RootState } from 'state/types'

import { useSteps } from '../useSteps'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData')
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useShopifyIntegrations')
jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

const mockUseFlagWithLoading = useFlagWithLoading as jest.Mock
const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock
const mockUseShopifyIntegrations = useShopifyIntegrations as jest.Mock

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useAiAgentScopesForAutomationPlan')
const useAiAgentScopesForAutomationPlanMock = assumeMock(
    useAiAgentScopesForAutomationPlan,
)

const initialState = {
    billing: fromJS({
        products,
    }),
} as RootState

describe('useSteps', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })
        mockUseShopifyIntegrations.mockReturnValue([])
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: true,
            integrationId: 123,
            needScopeUpdate: false,
        })

        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ])
    })

    it('should return all steps when no integration exists', () => {
        mockUseShopifyIntegrationAndScope.mockReturnValue({
            integration: null,
            integrationId: null,
            needScopeUpdate: false,
        })

        const { result } = renderHook(
            () => useSteps({ shopName: 'test-shop' }),
            { storeState: initialState },
        )

        expect(result.current.validSteps).toEqual([
            { step: WizardStepEnum.SHOPIFY_INTEGRATION, condition: true },
            { step: WizardStepEnum.TONE_OF_VOICE, condition: true },
            { step: WizardStepEnum.SALES_PERSONALITY, condition: true },
            { step: WizardStepEnum.ENGAGEMENT, condition: true },
            { step: WizardStepEnum.KNOWLEDGE, condition: true },
        ])
    })

    it('should exclude SHOPIFY_INTEGRATION step when integration exists', () => {
        const { result } = renderHook(
            () => useSteps({ shopName: 'test-shop' }),
            { storeState: initialState },
        )

        expect(result.current.validSteps).toEqual([
            { step: WizardStepEnum.TONE_OF_VOICE, condition: true },
            {
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: true,
            },
            { step: WizardStepEnum.ENGAGEMENT, condition: true },
            { step: WizardStepEnum.KNOWLEDGE, condition: true },
        ])
        expect(result.current.totalSteps).toBe(4)
    })

    it('should include SALES_PERSONALITY step when plan supports AI Agent Sales', () => {
        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
            AiAgentScopes.SALES,
        ])
        const { result } = renderHook(
            () =>
                useSteps({
                    shopName: 'test-shop',
                }),
            { storeState: initialState },
        )

        expect(result.current.validSteps).toContainEqual({
            step: WizardStepEnum.SALES_PERSONALITY,
            condition: true,
        })
    })

    it('should not include SALES_PERSONALITY step when when plan does not support AI Agent Sales', () => {
        useAiAgentScopesForAutomationPlanMock.mockReturnValue([
            AiAgentScopes.SUPPORT,
        ])
        const { result } = renderHook(
            () =>
                useSteps({
                    shopName: 'test-shop',
                }),
            { storeState: initialState },
        )

        expect(result.current.validSteps).not.toContainEqual({
            step: WizardStepEnum.SALES_PERSONALITY,
            condition: true,
        })
    })

    describe('when ?jtbd= is present in URL', () => {
        beforeEach(() => {
            mockUseFlagWithLoading.mockImplementation((key) => ({
                value: key === FeatureFlagKey.AiAgentOnboardingV3,
                isLoading: false,
            }))
        })

        it('ignores ?jtbd= and falls back to scope-driven steps when V3 flag is off', () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: false,
                isLoading: false,
            })
            useAiAgentScopesForAutomationPlanMock.mockReturnValue([
                AiAgentScopes.SUPPORT,
            ])

            const { result } = renderHook(
                () => useSteps({ shopName: 'test-shop' }),
                {
                    storeState: initialState,
                    initialEntries: ['/onboarding/tone of voice?jtbd=sales'],
                },
            )

            expect(result.current.validSteps).not.toContainEqual({
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: true,
            })
            expect(result.current.validSteps).not.toContainEqual({
                step: WizardStepEnum.ENGAGEMENT,
                condition: true,
            })
        })

        it('should include SALES_PERSONALITY and ENGAGEMENT when jtbd=sales, ignoring scopes', () => {
            useAiAgentScopesForAutomationPlanMock.mockReturnValue([
                AiAgentScopes.SUPPORT,
            ])

            const { result } = renderHook(
                () => useSteps({ shopName: 'test-shop' }),
                {
                    storeState: initialState,
                    initialEntries: ['/onboarding/tone of voice?jtbd=sales'],
                },
            )

            expect(result.current.validSteps).toContainEqual({
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: true,
            })
            expect(result.current.validSteps).toContainEqual({
                step: WizardStepEnum.ENGAGEMENT,
                condition: true,
            })
        })

        it('should exclude SALES_PERSONALITY and ENGAGEMENT when jtbd=support, ignoring scopes', () => {
            useAiAgentScopesForAutomationPlanMock.mockReturnValue([
                AiAgentScopes.SUPPORT,
                AiAgentScopes.SALES,
            ])

            const { result } = renderHook(
                () => useSteps({ shopName: 'test-shop' }),
                {
                    storeState: initialState,
                    initialEntries: ['/onboarding/tone of voice?jtbd=support'],
                },
            )

            expect(result.current.validSteps).not.toContainEqual({
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: true,
            })
            expect(result.current.validSteps).not.toContainEqual({
                step: WizardStepEnum.ENGAGEMENT,
                condition: true,
            })
        })

        it('falls back to scope-driven steps when jtbd value is unrecognized', () => {
            useAiAgentScopesForAutomationPlanMock.mockReturnValue([
                AiAgentScopes.SUPPORT,
                AiAgentScopes.SALES,
            ])

            const { result } = renderHook(
                () => useSteps({ shopName: 'test-shop' }),
                {
                    storeState: initialState,
                    initialEntries: ['/onboarding/tone of voice?jtbd=other'],
                },
            )

            expect(result.current.validSteps).toContainEqual({
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: true,
            })
            expect(result.current.validSteps).toContainEqual({
                step: WizardStepEnum.ENGAGEMENT,
                condition: true,
            })
        })

        it('falls back to scope-driven steps when jtbd value is empty', () => {
            useAiAgentScopesForAutomationPlanMock.mockReturnValue([
                AiAgentScopes.SUPPORT,
                AiAgentScopes.SALES,
            ])

            const { result } = renderHook(
                () => useSteps({ shopName: 'test-shop' }),
                {
                    storeState: initialState,
                    initialEntries: ['/onboarding/tone of voice?jtbd='],
                },
            )

            expect(result.current.validSteps).toContainEqual({
                step: WizardStepEnum.SALES_PERSONALITY,
                condition: true,
            })
            expect(result.current.validSteps).toContainEqual({
                step: WizardStepEnum.ENGAGEMENT,
                condition: true,
            })
        })
    })
})
