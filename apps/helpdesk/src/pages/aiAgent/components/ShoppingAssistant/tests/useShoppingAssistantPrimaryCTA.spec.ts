import { renderHook } from '@testing-library/react'

import { shopifyIntegration } from 'fixtures/integrations'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'

import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from '../constants/shoppingAssistant'
import { useShoppingAssistantPrimaryCTA } from '../hooks/useShoppingAssistantPrimaryCTA'
import {
    PromoCardVariant,
    TrialEventType,
    TrialType,
} from '../types/ShoppingAssistant'
import { logInTrialEvent, logTrialBannerEvent } from '../utils/eventLogger'

jest.mock('../utils/eventLogger', () => ({
    logTrialBannerEvent: jest.fn(),
    logInTrialEvent: jest.fn(),
}))

jest.mock('pages/aiAgent/trial/hooks/useUpgradePlan', () => ({
    useUpgradePlan: () => ({
        upgradePlanAsync: jest.fn(),
        isLoading: false,
    }),
}))

const mockPush = jest.fn()
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockPush,
    }),
}))

const mockLogTrialBannerEvent = logTrialBannerEvent as jest.Mock
const mockLogInTrialEvent = logInTrialEvent as jest.Mock

// Helper function to create complete UseShoppingAssistantTrialFlowReturn mock objects
const createMockTrialFlow = (overrides = {}) =>
    getUseShoppingAssistantTrialFlowFixture(overrides)

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

describe('useShoppingAssistantPrimaryCTA', () => {
    it('returns AdminTrialProgress variant with "Upgrade now" button for admin in trial with opted out status', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasAnyTrialOptedOut: true,
                isAdminUser: true,
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

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrialProgress,
            button: {
                label: 'Upgrade now',
                onClick: expect.any(Function),
                disabled: false,
                isLoading: false,
            },
        })
    })

    it('returns AdminTrialProgress variant with "Upgrade now" button for admin in trial with GMV above threshold', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                isAdminUser: true,
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

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrialProgress,
            button: {
                label: 'Upgrade now',
                onClick: expect.any(Function),
                disabled: false,
                isLoading: false,
            },
        })
    })

    it('returns AdminTrialProgress variant with "Set Up Sales Strategy" button for admin in trial', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                hasAnyTrialOptedOut: false,
                isAdminUser: true,
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

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrialProgress,
            button: {
                label: 'Upgrade now',
                onClick: expect.any(Function),
                disabled: false,
                isLoading: false,
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

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

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

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

        expect(result.current).toEqual({
            variant: PromoCardVariant.LeadTrialProgress,
            button: {
                label: '',
                disabled: true,
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

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                onClick: expect.any(Function),
                disabled: false,
            },
        })

        result.current?.button?.onClick?.()
        expect(mockLogTrialBannerEvent).toHaveBeenCalledWith(
            TrialEventType.StartTrial,
            TrialType.ShoppingAssistant,
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

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                onClick: expect.any(Function),
                disabled: false,
            },
        })

        result.current?.button?.onClick?.()
        expect(mockLogTrialBannerEvent).toHaveBeenCalledWith(
            TrialEventType.StartTrial,
            TrialType.ShoppingAssistant,
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

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

        expect(result.current).toEqual({
            variant: PromoCardVariant.LeadNotify,
            button: {
                label: 'Notify admin',
                onClick: expect.any(Function),
                disabled: false,
            },
        })

        result.current?.button?.onClick?.()
        expect(mockLogTrialBannerEvent).toHaveBeenCalledWith(
            TrialEventType.NotifyAdmin,
            TrialType.ShoppingAssistant,
        )
        expect(mockOpenTrialRequestModal).toHaveBeenCalled()
    })

    it('returns AdminTrial variant with trial button for PRO+ admin ', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: true,
                canNotifyAdmin: false,
                canBookDemo: true,
                isAdminUser: true,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )
        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                onClick: expect.any(Function),
                disabled: false,
            },
        })

        result.current?.button?.onClick?.()
        expect(mockLogTrialBannerEvent).toHaveBeenCalledWith(
            TrialEventType.StartTrial,
            TrialType.ShoppingAssistant,
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

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

        expect(result.current).toEqual({
            variant: PromoCardVariant.LeadNotify,
            button: {
                label: 'Notify admin',
                onClick: expect.any(Function),
                disabled: false,
            },
        })
    })

    it('returns Hidden variant for expired trial - promo card should not be shown', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: true,
                isAdminUser: true,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

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

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

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
        expect(mockLogTrialBannerEvent).toHaveBeenCalledWith(
            TrialEventType.Learn,
            TrialType.ShoppingAssistant,
        )
    })

    it('calls openUpgradePlanModal(false) when upgrade button is clicked for opted out trial', async () => {
        const mockOpenUpgradePlanModal = jest.fn()
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: true,
                isAdminUser: true,
            }),
            trialFlow: createMockTrialFlow({
                openUpgradePlanModal: mockOpenUpgradePlanModal,
            }),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() =>
            useShoppingAssistantPrimaryCTA(props),
        )

        expect(result.current.variant).toBe(PromoCardVariant.AdminTrialProgress)
        expect(result.current.button.label).toBe('Upgrade now')

        // Click the upgrade button
        await result.current?.button?.onClick?.()

        expect(mockLogInTrialEvent).toHaveBeenCalledWith(
            TrialEventType.UpgradePlan,
            TrialType.ShoppingAssistant,
        )
        expect(mockOpenUpgradePlanModal).toHaveBeenCalledWith(false)
        expect(mockOpenUpgradePlanModal).toHaveBeenCalledTimes(1)
    })
})
