import { renderHook } from '@testing-library/react'

import { shopifyIntegration } from 'fixtures/integrations'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'

import { useAiAgentPrimaryCTA } from '../hooks/useAiAgentPrimaryCTA'
import {
    PromoCardVariant,
    TrialEventType,
    TrialType,
} from '../types/ShoppingAssistant'
import { logTrialBannerEvent } from '../utils/eventLogger'

jest.mock('../utils/eventLogger', () => ({
    logTrialBannerEvent: jest.fn(),
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

const createMockTrialFlow = (overrides = {}) =>
    getUseShoppingAssistantTrialFlowFixture(overrides)

const createMockTrialMetrics = (overrides = {}) => ({
    gmvInfluenced: '$0.00',
    gmvInfluencedRate: 0,
    automationRate: {
        value: 0,
        prevValue: 0,
        isLoading: false,
    },
    isLoading: false,
    ...overrides,
})

describe('useAiAgentPrimaryCTA', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns AdminTrialProgress variant with "Upgrade now" button for admin in trial with opted out status', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: true,
                isAdminUser: true,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics({
                automationRate: {
                    value: 0.03,
                    prevValue: 0.02,
                    isLoading: false,
                },
                isLoading: false,
            }),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => useAiAgentPrimaryCTA(props))

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

    it('returns AdminTrialProgress variant with "Upgrade now" button for admin in trial with automation above threshold', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                isAdminUser: true,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics({
                automationRate: {
                    value: 0.11, // Above 0.1 threshold
                    prevValue: 0.1,
                    isLoading: false,
                },
                isLoading: false,
            }),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => useAiAgentPrimaryCTA(props))

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

    it('returns AdminTrialProgress variant with "Upgrade now" button for admin in trial with automation below threshold', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                isAdminUser: true,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics({
                automationRate: {
                    value: 0.03,
                    prevValue: 0.02,
                    isLoading: false,
                },
                isLoading: false,
            }),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => useAiAgentPrimaryCTA(props))

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
                automationRate: {
                    value: 0.03,
                    prevValue: 0.02,
                    isLoading: false,
                },
                isLoading: false,
            }),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => useAiAgentPrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.LeadTrialProgress,
            button: {
                label: '',
                disabled: true,
            },
        })
    })

    it('returns LeadTrialProgress variant with empty button for non-admin in trial with automation below threshold', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: false,
                canSeeTrialCTA: false,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics({
                automationRate: {
                    value: 0.03,
                    prevValue: 0.02,
                    isLoading: false,
                },
                isLoading: false,
            }),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => useAiAgentPrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.LeadTrialProgress,
            button: {
                label: '',
                disabled: true,
            },
        })
    })

    it('returns AdminTrial variant with "Try for free" button when user has no automate plan', () => {
        const mockOpenTrialUpgradeModal = jest.fn()
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: true,
                currentAutomatePlan: null,
            }),
            trialFlow: createMockTrialFlow({
                openTrialUpgradeModal: mockOpenTrialUpgradeModal,
            }),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => useAiAgentPrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: 'Try for free',
                onClick: expect.any(Function),
                disabled: false,
            },
        })

        result.current?.button?.onClick?.()
        expect(mockLogTrialBannerEvent).toHaveBeenCalledWith(
            TrialEventType.StartTrial,
            TrialType.AiAgent,
        )
        expect(mockPush).toHaveBeenCalled()
    })

    it('returns AdminTrial variant with trial button for admin not in trial - opens modal when routeShopName provided', () => {
        const mockOpenTrialUpgradeModal = jest.fn()
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: true,
                currentAutomatePlan: 'some-plan',
            }),
            trialFlow: createMockTrialFlow({
                openTrialUpgradeModal: mockOpenTrialUpgradeModal,
            }),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: 'test-shop',
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => useAiAgentPrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.AdminTrial,
            button: {
                label: `Try for free`,
                onClick: expect.any(Function),
                disabled: false,
            },
        })

        result.current?.button?.onClick?.()
        expect(mockLogTrialBannerEvent).toHaveBeenCalledWith(
            TrialEventType.StartTrial,
            TrialType.AiAgent,
        )
        expect(mockOpenTrialUpgradeModal).toHaveBeenCalled()
    })

    it('returns LeadNotify variant with notify button for user who can notify admin', () => {
        const mockOpenTrialRequestModal = jest.fn()
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: true,
            }),
            trialFlow: createMockTrialFlow({
                openTrialRequestModal: mockOpenTrialRequestModal,
            }),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => useAiAgentPrimaryCTA(props))

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
            TrialType.AiAgent,
        )
        expect(mockOpenTrialRequestModal).toHaveBeenCalled()
    })

    it('returns Hidden variant with empty button as default', () => {
        const props = {
            trialAccess: createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                canSeeTrialCTA: false,
                canNotifyAdmin: false,
            }),
            trialFlow: createMockTrialFlow(),
            isDisabled: false,
            trialMetrics: createMockTrialMetrics(),
            routeShopName: undefined,
            firstShopifyIntegration: shopifyIntegration,
        }

        const { result } = renderHook(() => useAiAgentPrimaryCTA(props))

        expect(result.current).toEqual({
            variant: PromoCardVariant.Hidden,
            button: {
                label: '',
                disabled: true,
            },
        })
    })
})
