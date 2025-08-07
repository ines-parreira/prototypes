import { renderHook } from '@testing-library/react'

import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from '../constants/shoppingAssistant'
import { useTrialDescription } from '../hooks/useTrialDescription'

const createMockTrialAccess = (overrides = {}) => ({
    canNotifyAdmin: false,
    canBookDemo: false,
    canSeeSystemBanner: false,
    canSeeTrialCTA: false,
    hasCurrentStoreTrialStarted: false,
    hasAnyTrialStarted: false,
    hasCurrentStoreTrialOptedOut: false,
    hasAnyTrialOptedOut: false,
    hasCurrentStoreTrialExpired: false,
    hasAnyTrialExpired: false,
    hasAnyTrialOptedIn: false,
    hasAnyTrialActive: false,
    isLoading: false,
    ...overrides,
})

describe('useTrialDescription', () => {
    it('shows GMV influenced when in trial and opted out', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialStarted: true,
            hasAnyTrialStarted: true,
            hasCurrentStoreTrialOptedOut: true,
        })

        const trialMetrics = {
            gmvInfluenced: '$1,000',
            gmvInfluencedRate: 0.1,
            isLoading: false,
        }

        const { result } = renderHook(() =>
            useTrialDescription(trialAccess, trialMetrics, true),
        )

        expect(result.current.description).toBe('$1,000 GMV influenced')
        expect(result.current.shouldShowDescriptionIcon).toBe(true)
    })

    it('shows GMV influenced when in trial and GMV rate above threshold', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialStarted: true,
            hasAnyTrialStarted: false,
        })

        const trialMetrics = {
            gmvInfluenced: '$500',
            gmvInfluencedRate: 0.06,
            isLoading: false,
        }

        const { result } = renderHook(() =>
            useTrialDescription(trialAccess, trialMetrics, true),
        )

        expect(result.current.description).toBe('$500 GMV influenced')
        expect(result.current.shouldShowDescriptionIcon).toBe(true)
    })

    it('shows empty description when in trial but GMV rate below threshold and not opted out', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialStarted: true,
            hasAnyTrialStarted: false,
        })

        const trialMetrics = {
            gmvInfluenced: '$100',
            gmvInfluencedRate: 0.003,
            isLoading: false,
        }

        const { result } = renderHook(() =>
            useTrialDescription(trialAccess, trialMetrics, true),
        )

        expect(result.current.description).toBe('')
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })

    it('shows empty description when metrics are loading', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialStarted: true,
            hasAnyTrialStarted: false,
        })

        const trialMetrics = {
            gmvInfluenced: '$1,000',
            gmvInfluencedRate: 0.1,
            isLoading: true, // Loading state
        }

        const { result } = renderHook(() =>
            useTrialDescription(trialAccess, trialMetrics, true),
        )

        expect(result.current.description).toBe('')
        expect(result.current.shouldShowDescriptionIcon).toBe(true)
    })

    it('shows default description when not in trial', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialStarted: false,
            hasAnyTrialStarted: false,
        })

        const trialMetrics = {
            gmvInfluenced: '$0',
            gmvInfluencedRate: 0,
            isLoading: false,
        }

        const { result } = renderHook(() =>
            useTrialDescription(trialAccess, trialMetrics, false),
        )

        expect(result.current.description).toBe(
            'Go beyond automation and grow revenue by 1.5%.',
        )
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })

    it('shows trial duration description when user can notify admin', () => {
        const trialAccess = createMockTrialAccess({
            canNotifyAdmin: true,
        })

        const trialMetrics = {
            gmvInfluenced: '$0',
            gmvInfluencedRate: 0,
            isLoading: false,
        }

        const { result } = renderHook(() =>
            useTrialDescription(trialAccess, trialMetrics, false),
        )

        expect(result.current.description).toBe(
            `Try AI Agent's shopping assistant capabilities for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days.`,
        )
        expect(result.current.shouldShowDescriptionIcon).toBe(false)
    })
})
