import { renderHook } from '@testing-library/react'

import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from '../constants/shoppingAssistant'
import { useTrialDescription } from '../hooks/useTrialDescription'
import { TrialType } from '../types/ShoppingAssistant'

describe('useTrialDescription', () => {
    const createTrialMetrics = (overrides = {}) => ({
        gmvInfluenced: '$1,000',
        gmvInfluencedRate: 0.1,
        isLoading: false,
        ...overrides,
    })

    it('shows GMV influenced when in trial and opted out', () => {
        const canNotifyAdmin = false
        const isTrialProgress = true

        const trialMetrics = createTrialMetrics()

        const { result } = renderHook(() =>
            useTrialDescription(
                canNotifyAdmin,
                trialMetrics,
                isTrialProgress,
                TrialType.ShoppingAssistant,
            ),
        )

        expect(result.current.description).toBe('$1,000 GMV influenced')
        expect(result.current.shouldShowDescriptionIcon).toBe(true)
    })

    it('shows GMV influenced when in trial and GMV rate above threshold', () => {
        const canNotifyAdmin = false
        const isTrialProgress = true

        const trialMetrics = createTrialMetrics({
            gmvInfluenced: '$500',
            gmvInfluencedRate: 0.06,
        })

        const { result } = renderHook(() =>
            useTrialDescription(
                canNotifyAdmin,
                trialMetrics,
                isTrialProgress,
                TrialType.ShoppingAssistant,
            ),
        )

        expect(result.current.description).toBe('$500 GMV influenced')
        expect(result.current.shouldShowDescriptionIcon).toBe(true)
    })

    it('shows empty description when in trial but GMV rate below threshold and not opted out', () => {
        const canNotifyAdmin = false
        const isTrialProgress = true

        const trialMetrics = createTrialMetrics({
            gmvInfluenced: '$100',
            gmvInfluencedRate: 0.003,
        })

        const { result } = renderHook(() =>
            useTrialDescription(
                canNotifyAdmin,
                trialMetrics,
                isTrialProgress,
                TrialType.ShoppingAssistant,
            ),
        )

        expect(result.current.description).toBe('')
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })

    it('shows empty description and no icon when metrics are loading', () => {
        const canNotifyAdmin = false
        const isTrialProgress = true

        const trialMetrics = createTrialMetrics({
            isLoading: true, // Loading state
        })

        const { result } = renderHook(() =>
            useTrialDescription(
                canNotifyAdmin,
                trialMetrics,
                isTrialProgress,
                TrialType.ShoppingAssistant,
            ),
        )

        expect(result.current.description).toBe('')
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })

    it('shows default description when not in trial', () => {
        const canNotifyAdmin = false
        const isTrialProgress = false

        const trialMetrics = createTrialMetrics({
            gmvInfluenced: '$0',
            gmvInfluencedRate: 0,
        })

        const { result } = renderHook(() =>
            useTrialDescription(
                canNotifyAdmin,
                trialMetrics,
                isTrialProgress,
                TrialType.ShoppingAssistant,
            ),
        )

        expect(result.current.description).toBe(
            'Go beyond automation and grow revenue by 1.5%.',
        )
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })

    it('shows trial duration description when user can notify admin', () => {
        const canNotifyAdmin = true
        const isTrialProgress = false

        const trialMetrics = createTrialMetrics({
            gmvInfluenced: '$0',
            gmvInfluencedRate: 0,
        })

        const { result } = renderHook(() =>
            useTrialDescription(
                canNotifyAdmin,
                trialMetrics,
                isTrialProgress,
                TrialType.ShoppingAssistant,
            ),
        )

        expect(result.current.description).toBe(
            `Try AI Agent's shopping assistant capabilities for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days.`,
        )
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })

    describe('AI Agent trial type', () => {
        it('shows default AI Agent description when not in trial', () => {
            const canNotifyAdmin = false
            const isTrialProgress = false

            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    canNotifyAdmin,
                    trialMetrics,
                    isTrialProgress,
                    TrialType.AiAgent,
                ),
            )

            expect(result.current.description).toBe(
                'Enhance every step of the shopping journey, from pre to post-sales.',
            )
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })

        it('shows AI Agent description when user can notify admin and not in trial', () => {
            const canNotifyAdmin = true
            const isTrialProgress = false

            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    canNotifyAdmin,
                    trialMetrics,
                    isTrialProgress,
                    TrialType.AiAgent,
                ),
            )

            expect(result.current.description).toBe(
                'Enhance every step of the shopping journey, from pre to post-sales.',
            )
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })

        it('shows automation rate when in trial and above threshold', () => {
            const canNotifyAdmin = false
            const isTrialProgress = true

            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const automationRate = {
                value: 0.075, // 7.5%
                prevValue: 0.065,
                isLoading: false,
            }

            const { result } = renderHook(() =>
                useTrialDescription(
                    canNotifyAdmin,
                    trialMetrics,
                    isTrialProgress,
                    TrialType.AiAgent,
                    automationRate,
                ),
            )

            expect(result.current.description).toBe('7.5% automation rate')
            expect(result.current.shouldShowDescriptionIcon).toBe(true)
        })

        it('shows empty description when in trial but automation rate below threshold', () => {
            const canNotifyAdmin = false
            const isTrialProgress = true

            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const automationRate = {
                value: 0.003, // 0.3% (below 0.5% threshold)
                prevValue: 0.002,
                isLoading: false,
            }

            const { result } = renderHook(() =>
                useTrialDescription(
                    canNotifyAdmin,
                    trialMetrics,
                    isTrialProgress,
                    TrialType.AiAgent,
                    automationRate,
                ),
            )

            expect(result.current.description).toBe('')
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })

        it('shows empty description and no icon when automation rate is loading', () => {
            const canNotifyAdmin = false
            const isTrialProgress = true

            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const automationRate = {
                value: 0.075, // 7.5%
                prevValue: 0.065,
                isLoading: true, // Loading state
            }

            const { result } = renderHook(() =>
                useTrialDescription(
                    canNotifyAdmin,
                    trialMetrics,
                    isTrialProgress,
                    TrialType.AiAgent,
                    automationRate,
                ),
            )

            expect(result.current.description).toBe('')
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })

        it('shows empty description when no automation rate data provided', () => {
            const canNotifyAdmin = false
            const isTrialProgress = true

            const trialMetrics = createTrialMetrics({
                gmvInfluenced: '$0',
                gmvInfluencedRate: 0,
            })

            const { result } = renderHook(() =>
                useTrialDescription(
                    canNotifyAdmin,
                    trialMetrics,
                    isTrialProgress,
                    TrialType.AiAgent,
                ),
            )

            expect(result.current.description).toBe('')
            expect(result.current.shouldShowDescriptionIcon).toBe(false)
        })
    })
})
