import { renderHook } from '@testing-library/react'

import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from '../constants/shoppingAssistant'
import { useTrialDescription } from '../hooks/useTrialDescription'
import { TrialType } from '../types/ShoppingAssistant'

describe('useTrialDescription', () => {
    const createTrialMetrics = (overrides = {}) => ({
        gmvInfluenced: '$1,000',
        gmvInfluencedRate: 0.1,
        automationRate: undefined,
        isLoading: false,
        ...overrides,
    })

    const createMockData = (overrides = {}) => ({
        canNotifyAdmin: false,
        isTrialProgress: false,
        trialType: TrialType.ShoppingAssistant,
        isExpandingTrialExperienceMilestone2Enabled: false,
        isOnboarded: true,
        ...overrides,
    })

    it('shows GMV influenced when in trial and opted out', () => {
        const mockData = createMockData({
            isTrialProgress: true,
        })
        const trialMetrics = createTrialMetrics()

        const { result } = renderHook(() =>
            useTrialDescription(
                mockData.canNotifyAdmin,
                trialMetrics,
                mockData.isTrialProgress,
                mockData.trialType,
                mockData.isExpandingTrialExperienceMilestone2Enabled,
                mockData.isOnboarded,
            ),
        )

        expect(result.current.description).toBe('$1,000 GMV influenced')
        expect(result.current.shouldShowDescriptionIcon).toBe(true)
    })

    it('shows GMV influenced when in trial and GMV rate above threshold', () => {
        const mockData = createMockData({
            isTrialProgress: true,
        })
        const trialMetrics = createTrialMetrics({
            gmvInfluenced: '$500',
            gmvInfluencedRate: 0.06,
        })

        const { result } = renderHook(() =>
            useTrialDescription(
                mockData.canNotifyAdmin,
                trialMetrics,
                mockData.isTrialProgress,
                mockData.trialType,
                mockData.isExpandingTrialExperienceMilestone2Enabled,
                mockData.isOnboarded,
            ),
        )

        expect(result.current.description).toBe('$500 GMV influenced')
        expect(result.current.shouldShowDescriptionIcon).toBe(true)
    })

    it('shows empty description when in trial but GMV rate below threshold and not opted out', () => {
        const mockData = createMockData({
            isTrialProgress: true,
        })
        const trialMetrics = createTrialMetrics({
            gmvInfluenced: '$100',
            gmvInfluencedRate: 0.003,
        })

        const { result } = renderHook(() =>
            useTrialDescription(
                mockData.canNotifyAdmin,
                trialMetrics,
                mockData.isTrialProgress,
                mockData.trialType,
                mockData.isExpandingTrialExperienceMilestone2Enabled,
                mockData.isOnboarded,
            ),
        )

        expect(result.current.description).toBe('')
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })

    it('shows empty description and no icon when metrics are loading', () => {
        const mockData = createMockData({
            isTrialProgress: true,
        })
        const trialMetrics = createTrialMetrics({
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useTrialDescription(
                mockData.canNotifyAdmin,
                trialMetrics,
                mockData.isTrialProgress,
                mockData.trialType,
                mockData.isExpandingTrialExperienceMilestone2Enabled,
                mockData.isOnboarded,
            ),
        )

        expect(result.current.description).toBe('')
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })

    it('shows default description when not in trial', () => {
        const mockData = createMockData()
        const trialMetrics = createTrialMetrics({
            gmvInfluenced: '$0',
            gmvInfluencedRate: 0,
        })

        const { result } = renderHook(() =>
            useTrialDescription(
                mockData.canNotifyAdmin,
                trialMetrics,
                mockData.isTrialProgress,
                mockData.trialType,
                mockData.isExpandingTrialExperienceMilestone2Enabled,
                mockData.isOnboarded,
            ),
        )

        expect(result.current.description).toBe(
            'Go beyond automation and grow revenue by 1.5%.',
        )
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })

    it('shows trial duration description when user can notify admin', () => {
        const mockData = createMockData({
            canNotifyAdmin: true,
        })
        const trialMetrics = createTrialMetrics({
            gmvInfluenced: '$0',
            gmvInfluencedRate: 0,
        })

        const { result } = renderHook(() =>
            useTrialDescription(
                mockData.canNotifyAdmin,
                trialMetrics,
                mockData.isTrialProgress,
                mockData.trialType,
                mockData.isExpandingTrialExperienceMilestone2Enabled,
                mockData.isOnboarded,
            ),
        )

        expect(result.current.description).toBe(
            `Try AI Agent's shopping assistant capabilities for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days.`,
        )
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })

    describe('AI Agent trial type', () => {
        it('shows default AI Agent description when not in trial', () => {
            const mockData = createMockData({
                trialType: TrialType.AiAgent,
            })
            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    mockData.canNotifyAdmin,
                    trialMetrics,
                    mockData.isTrialProgress,
                    mockData.trialType,
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.isOnboarded,
                ),
            )

            expect(result.current.description).toBe(
                'Enhance every step of the shopping journey, from pre to post-sales.',
            )
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })

        it('shows AI Agent description when user can notify admin and not in trial', () => {
            const mockData = createMockData({
                canNotifyAdmin: true,
                trialType: TrialType.AiAgent,
            })
            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    mockData.canNotifyAdmin,
                    trialMetrics,
                    mockData.isTrialProgress,
                    mockData.trialType,
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.isOnboarded,
                ),
            )

            expect(result.current.description).toBe(
                'Enhance every step of the shopping journey, from pre to post-sales.',
            )
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })

        it('shows automation rate when in trial and above threshold', () => {
            const mockData = createMockData({
                trialType: TrialType.AiAgent,
                isTrialProgress: true,
            })
            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
                automationRate: {
                    value: 0.075,
                    prevValue: 0.065,
                    isLoading: false,
                },
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    mockData.canNotifyAdmin,
                    trialMetrics,
                    mockData.isTrialProgress,
                    mockData.trialType,
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.isOnboarded,
                ),
            )

            expect(result.current.description).toBe('7.5% automation rate')
            expect(result.current.shouldShowDescriptionIcon).toBe(true)
        })

        it('shows empty description when in trial but automation rate below threshold', () => {
            const mockData = createMockData({
                trialType: TrialType.AiAgent,
                isTrialProgress: true,
            })
            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
                automationRate: {
                    value: 0.003,
                    prevValue: 0.002,
                    isLoading: false,
                },
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    mockData.canNotifyAdmin,
                    trialMetrics,
                    mockData.isTrialProgress,
                    mockData.trialType,
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.isOnboarded,
                ),
            )

            expect(result.current.description).toBe('')
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })

        it('shows empty description and no icon when automation rate is loading', () => {
            const mockData = createMockData({
                trialType: TrialType.AiAgent,
                isTrialProgress: true,
            })
            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
                automationRate: {
                    value: 0.075,
                    prevValue: 0.065,
                    isLoading: true,
                },
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    mockData.canNotifyAdmin,
                    trialMetrics,
                    mockData.isTrialProgress,
                    mockData.trialType,
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.isOnboarded,
                ),
            )

            expect(result.current.description).toBe('')
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })

        it('shows empty description when no automation rate data provided', () => {
            const mockData = createMockData({
                trialType: TrialType.AiAgent,
                isTrialProgress: true,
            })
            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
                automationRate: undefined,
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    mockData.canNotifyAdmin,
                    trialMetrics,
                    mockData.isTrialProgress,
                    mockData.trialType,
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.isOnboarded,
                ),
            )

            expect(result.current.description).toBe('')
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })
    })

    describe('Shopping Assistant with non-onboarded AI Agent', () => {
        it('shows AI Agent description when feature flag enabled and AI agent not onboarded', () => {
            const mockData = createMockData({
                isExpandingTrialExperienceMilestone2Enabled: true,
                isOnboarded: false,
                trialType: TrialType.ShoppingAssistant,
            })
            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    mockData.canNotifyAdmin,
                    trialMetrics,
                    mockData.isTrialProgress,
                    mockData.trialType,
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.isOnboarded,
                ),
            )

            expect(result.current.description).toBe(
                'Enhance every step of the shopping journey, from pre to post-sales.',
            )
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })
        it('shows regular Shopping Assistant description when feature flag disabled even if AI agent not onboarded', () => {
            const mockData = createMockData({
                isExpandingTrialExperienceMilestone2Enabled: false,
                isOnboarded: false,
                trialType: TrialType.ShoppingAssistant,
            })
            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    mockData.canNotifyAdmin,
                    trialMetrics,
                    mockData.isTrialProgress,
                    mockData.trialType,
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.isOnboarded,
                ),
            )

            expect(result.current.description).toBe(
                'Go beyond automation and grow revenue by 1.5%.',
            )
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })

        it('shows regular Shopping Assistant description when feature flag enabled but AI agent is onboarded', () => {
            const mockData = createMockData({
                isExpandingTrialExperienceMilestone2Enabled: true,
                isOnboarded: true,
                trialType: TrialType.ShoppingAssistant,
            })
            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    mockData.canNotifyAdmin,
                    trialMetrics,
                    mockData.isTrialProgress,
                    mockData.trialType,
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.isOnboarded,
                ),
            )

            expect(result.current.description).toBe(
                'Go beyond automation and grow revenue by 1.5%.',
            )
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })

        it('shows regular Shopping Assistant description when isOnboarded is undefined', () => {
            const mockData = createMockData({
                isExpandingTrialExperienceMilestone2Enabled: true,
                isOnboarded: undefined,
                trialType: TrialType.ShoppingAssistant,
            })
            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    mockData.canNotifyAdmin,
                    trialMetrics,
                    mockData.isTrialProgress,
                    mockData.trialType,
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.isOnboarded,
                ),
            )

            expect(result.current.description).toBe(
                'Go beyond automation and grow revenue by 1.5%.',
            )
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })
    })
})
