import { renderHook } from '@testing-library/react'

import { shopifyIntegration } from 'fixtures/integrations'

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

const mockPush = jest.fn()
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockPush,
    }),
}))

const mockLogShoppingAssistantEvent = logShoppingAssistantEvent as jest.Mock

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

// Helper function to create complete UseShoppingAssistantTrialFlowReturn mock objects
const createMockTrialFlow = (overrides = {}) => ({
    startTrial: jest.fn(),
    revampStartTrial: jest.fn(),
    isLoading: false,
    isTrialModalOpen: false,
    isTrialFinishSetupModalOpen: false,
    isSuccessModalOpen: false,
    isManageTrialModalOpen: false,
    isUpgradePlanModalOpen: false,
    isTrialRequestModalOpen: false,
    closeTrialUpgradeModal: jest.fn(),
    onDismissTrialUpgradeModal: jest.fn(),
    onDismissUpgradePlanModal: jest.fn(),
    closeSuccessModal: jest.fn(),
    closeManageTrialModal: jest.fn(),
    openTrialUpgradeModal: jest.fn(),
    onConfirmTrial: jest.fn(),
    openManageTrialModal: jest.fn(),
    openUpgradePlanModal: jest.fn(),
    closeUpgradePlanModal: jest.fn(),
    closeTrialFinishSetupModal: jest.fn(),
    openTrialFinishSetupModal: jest.fn(),
    openTrialRequestModal: jest.fn(),
    closeTrialRequestModal: jest.fn(),
    onRequestTrialExtension: jest.fn(),
    ...overrides,
})

// Helper function to create complete TrialMetrics mock objects
const createMockTrialMetrics = (overrides = {}) => ({
    gmvInfluenced: '$0.00',
    gmvInfluencedRate: 0,
    isLoading: false,
    ...overrides,
})

beforeEach(() => {
    jest.clearAllMocks()
})

describe('usePrimaryCTA', () => {
    it('returns AdminTrialProgress variant with "Upgrade now" button for admin in trial with opted out status', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasAnyTrialOptedOut: true,
                canSeeTrialCTA: true,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics({
                gmvInfluencedRate: 0.03,
                isLoading: false,
            }),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
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
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                canSeeTrialCTA: true,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics({
                gmvInfluencedRate: 0.06, // Above 0.05 threshold
                isLoading: false,
            }),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
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
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                canSeeTrialCTA: true,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics({
                gmvInfluencedRate: 0.003,
                isLoading: false,
            }),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
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
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: true,
                canSeeTrialCTA: false,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics({
                gmvInfluencedRate: 0.03,
                isLoading: false,
            }),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
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
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                canSeeTrialCTA: false,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics({
                gmvInfluencedRate: 0.003,
                isLoading: false,
            }),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
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

    it('returns AdminTrial variant with trial button for admin not in trial - opens modal when no routeShopName', () => {
        const mockOpenTrialUpgradeModal = jest.fn()
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: true,
            }),
            trialFlow: createMockTrialFlow({
                openTrialUpgradeModal: mockOpenTrialUpgradeModal,
            }),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
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
        expect(mockPush).toHaveBeenCalled()
    })

    it('returns AdminTrial variant with trial button for admin not in trial - navigates when routeShopName provided', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: true,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: 'test-shop',
            firstShopifyIntegration: shopifyIntegration,
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
    })

    it('returns LeadNotify variant with notify button for user who can notify admin and book demo', () => {
        const mockOpenTrialRequestModal = jest.fn()
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: true,
                canBookDemo: true,
            }),
            trialFlow: createMockTrialFlow({
                openTrialRequestModal: mockOpenTrialRequestModal,
            }),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
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
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                canBookDemo: true,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => usePrimaryCTA(props))
        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminDemo,
            button: {
                label: 'Book a demo',
                href: expect.any(String),
                target: '_blank',
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
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: true,
                canBookDemo: false,
            }),
            trialFlow: createMockTrialFlow({
                openTrialRequestModal: mockOpenTrialRequestModal,
            }),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
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
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
                canBookDemo: false,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => usePrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.Hidden,
            button: {
                label: 'Learn more',
                href: expect.any(String),
                target: '_blank',
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
