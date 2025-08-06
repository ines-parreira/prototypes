import { renderHook } from '@testing-library/react'

import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from '../constants/shoppingAssistant'
import { usePrimaryCTA } from '../hooks/usePrimaryCTA'
import {
    PromoCardVariant,
    ShoppingAssistantEventType,
} from '../types/ShoppingAssistant'
import { logShoppingAssistantEvent } from '../utils/eventLogger'

jest.mock('../utils/eventLogger', () => ({
    logShoppingAssistantEvent: jest.fn(),
}))

const mockLogShoppingAssistantEvent = logShoppingAssistantEvent as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe('usePrimaryCTA', () => {
    it('returns AdminTrialProgress variant with "Upgrade now" button for admin in trial with opted out status', () => {
        const props = {
            trialAccess: {
                hasCurrentStoreTrialStarted: true,
                hasAnyTrialOptedOut: true,
                canSeeTrialCTA: true,
            },
            trialFlow: {},
            isDisabled: false,
            trialMetrics: {
                gmvInfluencedRate: 0.03,
                isLoading: false,
            },
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrialProgress,
            button: {
                label: 'Upgrade now',
                onClick: expect.any(Function),
                disabled: false,
            },
        })
    })

    it('returns AdminTrialProgress variant with "Upgrade now" button for admin in trial with GMV above threshold', () => {
        const props = {
            trialAccess: {
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                canSeeTrialCTA: true,
            },
            trialFlow: {},
            isDisabled: false,
            trialMetrics: {
                gmvInfluencedRate: 0.06, // Above 0.05 threshold
                isLoading: false,
            },
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrialProgress,
            button: {
                label: 'Upgrade now',
                onClick: expect.any(Function),
                disabled: false,
            },
        })
    })

    it('returns AdminTrialProgress variant with "Set Up Sales Strategy" button for admin in trial', () => {
        const props = {
            trialAccess: {
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                canSeeTrialCTA: true,
            },
            trialFlow: {},
            isDisabled: false,
            trialMetrics: {
                gmvInfluencedRate: 0.003,
                isLoading: false,
            },
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrialProgress,
            button: {
                label: 'Set Up Sales Strategy',
                onClick: expect.any(Function),
                disabled: false,
            },
        })
    })

    it('returns LeadTrialProgress variant with empty button for non-admin in trial with opted out status', () => {
        const props = {
            trialAccess: {
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: true,
                canSeeTrialCTA: false,
            },
            trialFlow: {},
            isDisabled: false,
            trialMetrics: {
                gmvInfluencedRate: 0.03,
                isLoading: false,
            },
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.LeadTrialProgress,
            button: {
                label: '',
                disabled: true,
            },
        })
    })

    it('returns LeadTrialProgress variant with "Set Up Sales Strategy" button for non-admin in trial', () => {
        const props = {
            trialAccess: {
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                canSeeTrialCTA: false,
            },
            trialFlow: {},
            isDisabled: false,
            trialMetrics: {
                gmvInfluencedRate: 0.003,
                isLoading: false,
            },
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.LeadTrialProgress,
            button: {
                label: 'Set Up Sales Strategy',
                onClick: expect.any(Function),
                disabled: false,
            },
        })
    })

    it('returns AdminTrial variant with trial button for admin not in trial', () => {
        const mockOpenTrialUpgradeModal = jest.fn()
        const props = {
            trialAccess: {
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: true,
            },
            trialFlow: {
                openTrialUpgradeModal: mockOpenTrialUpgradeModal,
            },
            isDisabled: false,
            trialMetrics: {},
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                onClick: expect.any(Function),
                disabled: false,
            },
        })

        result.current?.button?.onClick?.()
        expect(mockLogShoppingAssistantEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.StartTrial,
        )
        expect(mockOpenTrialUpgradeModal).toHaveBeenCalled()
    })

    it('returns LeadNotify variant with notify button for user who can notify admin and book demo', () => {
        const mockOpenTrialRequestModal = jest.fn()
        const props = {
            trialAccess: {
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: true,
                canBookDemo: true,
            },
            trialFlow: {
                openTrialRequestModal: mockOpenTrialRequestModal,
            },
            isDisabled: false,
            trialMetrics: {},
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.LeadNotify,
            button: {
                label: 'Notify admin',
                onClick: expect.any(Function),
                disabled: false,
            },
        })

        result.current?.button?.onClick?.()
        expect(mockLogShoppingAssistantEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.NotifyAdmin,
        )
        expect(mockOpenTrialRequestModal).toHaveBeenCalled()
    })

    it('returns AdminDemo variant with demo button for user who can book demo', () => {
        const props = {
            trialAccess: {
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                canBookDemo: true,
            },
            trialFlow: {},
            isDisabled: false,
            trialMetrics: {},
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminDemo,
            button: {
                label: 'Book a demo',
                href: expect.any(String),
                onClick: expect.any(Function),
                disabled: false,
            },
        })

        result.current?.button?.onClick?.()
        expect(mockLogShoppingAssistantEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.Demo,
        )
    })

    it('returns LeadNotify variant with notify button for user who can only notify admin', () => {
        const mockOpenTrialRequestModal = jest.fn()
        const props = {
            trialAccess: {
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: true,
                canBookDemo: false,
            },
            trialFlow: {
                openTrialRequestModal: mockOpenTrialRequestModal,
            },
            isDisabled: false,
            trialMetrics: {},
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.LeadNotify,
            button: {
                label: 'Notify admin',
                onClick: expect.any(Function),
                disabled: false,
            },
        })
    })

    it('returns Hidden variant with learn more button as default', () => {
        const props = {
            trialAccess: {
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                canBookDemo: false,
            },
            trialFlow: {},
            isDisabled: false,
            trialMetrics: {},
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.Hidden,
            button: {
                label: 'Learn more',
                href: expect.any(String),
                onClick: expect.any(Function),
                disabled: false,
            },
        })

        result.current?.button?.onClick?.()
        expect(mockLogShoppingAssistantEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.Learn,
        )
    })
})
