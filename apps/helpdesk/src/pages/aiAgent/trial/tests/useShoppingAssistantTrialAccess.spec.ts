import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { HelpdeskPlanTier } from 'models/billing/types'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import {
    useStoreActivations,
    useStoreConfigurations,
} from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useSalesTrialRevampMilestone } from '../hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialAccess } from '../hooks/useShoppingAssistantTrialAccess'

// Mock dependencies
jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('../hooks/useSalesTrialRevampMilestone')

// Mock utility functions
jest.mock('utils', () => ({
    ...jest.requireActual('utils'),
    createImmutableSelector: () => jest.fn(),
    isAdmin: jest.fn(),
    isTeamLead: jest.fn(),
}))

const mockUseFlags = assumeMock(useFlags)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseAtLeastOneStoreHasActiveTrial = assumeMock(
    useAtLeastOneStoreHasActiveTrial,
)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseStoreConfigurations = assumeMock(useStoreConfigurations)
const mockUseSalesTrialRevampMilestone = assumeMock(
    useSalesTrialRevampMilestone,
)
const mockIsAdmin = jest.requireMock('utils').isAdmin
const mockIsTeamLead = jest.requireMock('utils').isTeamLead

describe('useShoppingAssistantTrialAccess', () => {
    const mockUser = fromJS({
        id: 1,
        email: 'test@example.com',
        role: 'admin',
    })

    const mockAccount = fromJS({
        id: 123,
        domain: 'test-account',
    })

    const mockStoreActivations = {
        store1: storeActivationFixture({ storeName: 'Test Store' }),
    }

    const mockStoreConfigurations = [
        getStoreConfigurationFixture({
            storeName: 'Test Store',
            shopType: 'shopify',
            trialModeActivatedDatetime: null,
            monitoredChatIntegrations: [1, 2],
            sales: undefined, // No sales trial data
        }),
    ]

    beforeEach(() => {
        jest.clearAllMocks()

        // Default mock implementations
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiShoppingAssistantTrialMerchants]: true,
        })

        // Mock the new milestone hook to return 'milestone-1' (equivalent to true)
        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')

        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentUser) {
                return mockUser
            }
            if (selector === getCurrentAutomatePlan) {
                return { generation: 5 }
            }
            if (selector === getCurrentHelpdeskPlan) {
                return { tier: HelpdeskPlanTier.STARTER }
            }
            if (selector === getCurrentAccountState) {
                return mockAccount
            }
            return undefined
        })

        mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(false)
        mockUseStoreActivations.mockReturnValue({
            storeActivations: mockStoreActivations,
            progressPercentage: 50,
            isFetchLoading: false,
            isSaveLoading: false,
            changeSales: jest.fn(),
            changeSupport: jest.fn(),
            changeSupportChat: jest.fn(),
            changeSupportEmail: jest.fn(),
            saveStoreConfigurations: jest.fn(),
            migrateToNewPricing: jest.fn(),
            endTrial: jest.fn(),
            activation: jest.fn(),
        })
        mockUseStoreConfigurations.mockReturnValue({
            storeConfigurations: mockStoreConfigurations,
            storeNames: ['Test Store'],
            isLoading: false,
        })
        mockIsAdmin.mockReturnValue(true)
        mockIsTeamLead.mockReturnValue(false)
    })

    describe('when revamp trial is disabled', () => {
        it('should return all false when feature flag is disabled', () => {
            mockUseFlags.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantTrialMerchants]: true,
            })

            // Mock the milestone hook to return 'off' (equivalent to false)
            mockUseSalesTrialRevampMilestone.mockReturnValue('off')

            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })
    })

    describe('when all conditions are met for trial access', () => {
        it('should return correct access values for admin user on starter plan', () => {
            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: false,
                canBookDemo: false,
                canSeeSystemBanner: true, // Has AI Agent on chat + all other conditions
                canSeeTrialCTA: true,
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })

        it('should return correct access values for admin user on basic plan', () => {
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getCurrentUser) {
                    return mockUser
                }
                if (selector === getCurrentAutomatePlan) {
                    return { generation: 5 }
                }
                if (selector === getCurrentHelpdeskPlan) {
                    return { tier: HelpdeskPlanTier.BASIC }
                }
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                return undefined
            })

            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: false,
                canBookDemo: false,
                canSeeSystemBanner: true,
                canSeeTrialCTA: true,
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })

        it('should return correct access values for team lead user', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(true)

            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: true, // Team lead can notify admin
                canBookDemo: false,
                canSeeSystemBanner: false, // Only admins can see system banner
                canSeeTrialCTA: false, // Only admins can see trial CTA
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })
    })

    describe('when user is on Pro+ plan', () => {
        beforeEach(() => {
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getCurrentUser) {
                    return mockUser
                }
                if (selector === getCurrentAutomatePlan) {
                    return { generation: 5 }
                }
                if (selector === getCurrentHelpdeskPlan) {
                    return { tier: HelpdeskPlanTier.PRO }
                }
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                return undefined
            })
        })

        it('should allow Pro+ admin to see trial CTA when feature flag is enabled', () => {
            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: false,
                canBookDemo: false,
                canSeeSystemBanner: false, // System banner only for Starter/Basic
                canSeeTrialCTA: true, // Pro+ with feature flag can see trial CTA
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })

        it('should allow Pro+ admin to book demo when feature flag is disabled', () => {
            mockUseFlags.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantTrialMerchants]: false,
            })

            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: false,
                canBookDemo: true, // Pro+ without feature flag can book demo
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })

        it('should allow Pro+ team lead to notify admin when feature flag is enabled', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(true)

            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: true, // Team lead can notify for Pro+ with feature flag
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })
    })

    describe('when user is not on USD5 plan', () => {
        it('should return false for all trial access when generation >= 6', () => {
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getCurrentUser) {
                    return mockUser
                }
                if (selector === getCurrentAutomatePlan) {
                    return { generation: 6 }
                }
                if (selector === getCurrentHelpdeskPlan) {
                    return { tier: HelpdeskPlanTier.STARTER }
                }
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                return undefined
            })

            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })

        it('should return false for all trial access when no automate plan', () => {
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getCurrentUser) {
                    return mockUser
                }
                if (selector === getCurrentAutomatePlan) {
                    return null
                }
                if (selector === getCurrentHelpdeskPlan) {
                    return { tier: HelpdeskPlanTier.STARTER }
                }
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                return undefined
            })

            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })
    })

    describe('AI Agent on chat requirements', () => {
        it('should return false for system banner when no AI Agent on chat', () => {
            mockUseStoreConfigurations.mockReturnValue({
                storeConfigurations: [
                    getStoreConfigurationFixture({
                        storeName: 'Test Store',
                        shopType: 'shopify',
                        trialModeActivatedDatetime: null,
                        monitoredChatIntegrations: [], // No chat integrations
                    }),
                ],
                storeNames: ['Test Store'],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: false,
                canBookDemo: false,
                canSeeSystemBanner: false, // No AI Agent on chat
                canSeeTrialCTA: true, // Trial CTA doesn't require AI Agent on chat
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })
    })

    describe('when trial history exists', () => {
        it('should currently allow access since trial history check is placeholder', () => {
            // NOTE: This test documents current behavior with placeholder trial history
            // Once proper trial history API is implemented, this test should be updated
            // to expect false values when hasAlreadyCompletedTrial is true
            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            // With placeholder (hasAlreadyCompletedTrial = false), all conditions pass
            expect(result.current).toEqual({
                canNotifyAdmin: false,
                canBookDemo: false,
                canSeeSystemBanner: true,
                canSeeTrialCTA: true,
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })
    })

    describe('user role restrictions', () => {
        it('should return false for non-admin, non-team-lead users', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(false)

            const { result } = renderHook(() =>
                useShoppingAssistantTrialAccess(),
            )

            expect(result.current).toEqual({
                canNotifyAdmin: false,
                canBookDemo: false,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                hasAnyTrialActive: false,
                hasAnyTrialExpired: false,
                hasAnyTrialOptedIn: false,
                hasAnyTrialOptedOut: false,
                hasAnyTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasCurrentStoreTrialOptedOut: false,
                hasCurrentStoreTrialStarted: false,
            })
        })
    })

    describe('hasOptedOut scenarios', () => {
        beforeEach(() => {
            // Reset to default admin user on starter plan for these tests
            mockIsAdmin.mockReturnValue(true)
            mockIsTeamLead.mockReturnValue(false)
            // Set milestone to milestone-1 so the utility functions check for optOut
            mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getCurrentUser) {
                    return mockUser
                }
                if (selector === getCurrentAutomatePlan) {
                    return { generation: 5 }
                }
                if (selector === getCurrentHelpdeskPlan) {
                    return { tier: HelpdeskPlanTier.STARTER }
                }
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                return undefined
            })
        })

        describe('when user has opted out of trial', () => {
            it('should return hasOptedOut: true when store configurations have optOutDatetime', () => {
                const storeConfigurationWithOptOut =
                    getStoreConfigurationFixture({
                        storeName: 'Test Store',
                        shopType: 'shopify',
                        monitoredChatIntegrations: [1, 2],
                        sales: {
                            trial: {
                                startDatetime: null,
                                endDatetime: null,
                                account: {
                                    plannedUpgradeDatetime: null,
                                    optInDatetime: null,
                                    optOutDatetime: '2023-11-01T00:00:00.000Z',
                                    actualUpgradeDatetime: null,
                                    actualTerminationDatetime: null,
                                },
                            },
                        },
                    })

                const mockStoreActivationsWithOptOut = {
                    store1: {
                        ...storeActivationFixture({ storeName: 'Test Store' }),
                        configuration: storeConfigurationWithOptOut,
                    },
                }

                mockUseStoreActivations.mockReturnValue({
                    storeActivations: mockStoreActivationsWithOptOut,
                    progressPercentage: 50,
                    isFetchLoading: false,
                    isSaveLoading: false,
                    changeSales: jest.fn(),
                    changeSupport: jest.fn(),
                    changeSupportChat: jest.fn(),
                    changeSupportEmail: jest.fn(),
                    saveStoreConfigurations: jest.fn(),
                    migrateToNewPricing: jest.fn(),
                    endTrial: jest.fn(),
                    activation: jest.fn(),
                })

                mockUseStoreConfigurations.mockReturnValue({
                    storeConfigurations: [storeConfigurationWithOptOut],
                    storeNames: ['Test Store'],
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantTrialAccess(),
                )

                expect(result.current).toEqual({
                    canNotifyAdmin: false,
                    canBookDemo: false,
                    canSeeSystemBanner: true,
                    canSeeTrialCTA: true,
                    hasAnyTrialActive: false,
                    hasAnyTrialExpired: false,
                    hasAnyTrialOptedIn: false,
                    hasAnyTrialOptedOut: true,
                    hasAnyTrialStarted: false,
                    hasCurrentStoreTrialExpired: false,
                    hasCurrentStoreTrialOptedOut: false,
                    hasCurrentStoreTrialStarted: false,
                })
            })

            it('should return hasOptedOut: true when at least one store has opted out', () => {
                const storeConfig1 = getStoreConfigurationFixture({
                    storeName: 'Store 1',
                    shopType: 'shopify',
                    monitoredChatIntegrations: [1, 2],
                    sales: undefined, // No trial data
                })

                const storeConfig2 = getStoreConfigurationFixture({
                    storeName: 'Store 2',
                    shopType: 'shopify',
                    monitoredChatIntegrations: [1, 2],
                    sales: {
                        trial: {
                            startDatetime: null,
                            endDatetime: null,
                            account: {
                                plannedUpgradeDatetime: null,
                                optInDatetime: null,
                                optOutDatetime: '2023-11-01T00:00:00.000Z',
                                actualUpgradeDatetime: null,
                                actualTerminationDatetime: null,
                            },
                        },
                    },
                })

                const mockStoreActivationsWithMixed = {
                    store1: {
                        ...storeActivationFixture({ storeName: 'Store 1' }),
                        configuration: storeConfig1,
                    },
                    store2: {
                        ...storeActivationFixture({ storeName: 'Store 2' }),
                        configuration: storeConfig2,
                    },
                }

                mockUseStoreActivations.mockReturnValue({
                    storeActivations: mockStoreActivationsWithMixed,
                    progressPercentage: 50,
                    isFetchLoading: false,
                    isSaveLoading: false,
                    changeSales: jest.fn(),
                    changeSupport: jest.fn(),
                    changeSupportChat: jest.fn(),
                    changeSupportEmail: jest.fn(),
                    saveStoreConfigurations: jest.fn(),
                    migrateToNewPricing: jest.fn(),
                    endTrial: jest.fn(),
                    activation: jest.fn(),
                })

                mockUseStoreConfigurations.mockReturnValue({
                    storeConfigurations: [storeConfig1, storeConfig2],
                    storeNames: ['Store 1', 'Store 2'],
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantTrialAccess(),
                )

                expect(result.current.hasAnyTrialOptedOut).toBe(true)
            })
        })

        describe('when user has opted out with mixed store statuses', () => {
            it('should return hasOptedOut: true when different stores have different statuses', () => {
                const storeConfigWithOptIn = getStoreConfigurationFixture({
                    storeName: 'Store with OptIn',
                    shopType: 'shopify',
                    monitoredChatIntegrations: [1, 2],
                    sales: {
                        trial: {
                            startDatetime: null,
                            endDatetime: null,
                            account: {
                                plannedUpgradeDatetime: null,
                                optInDatetime: '2023-11-01T00:00:00.000Z',
                                optOutDatetime: null,
                                actualUpgradeDatetime: null,
                                actualTerminationDatetime: null,
                            },
                        },
                    },
                })

                const storeConfigWithOptOut = getStoreConfigurationFixture({
                    storeName: 'Store with OptOut',
                    shopType: 'shopify',
                    monitoredChatIntegrations: [1, 2],
                    sales: {
                        trial: {
                            account: {
                                plannedUpgradeDatetime: null,
                                optInDatetime: null,
                                optOutDatetime: '2023-11-02T00:00:00.000Z',
                                actualUpgradeDatetime: null,
                                actualTerminationDatetime: null,
                            },
                            startDatetime: null,
                            endDatetime: null,
                        },
                    },
                })

                const mockStoreActivationsWithBothStatuses = {
                    store1: {
                        ...storeActivationFixture({
                            storeName: 'Store with OptIn',
                        }),
                        configuration: storeConfigWithOptIn,
                    },
                    store2: {
                        ...storeActivationFixture({
                            storeName: 'Store with OptOut',
                        }),
                        configuration: storeConfigWithOptOut,
                    },
                }

                mockUseStoreActivations.mockReturnValue({
                    storeActivations: mockStoreActivationsWithBothStatuses,
                    progressPercentage: 50,
                    isFetchLoading: false,
                    isSaveLoading: false,
                    changeSales: jest.fn(),
                    changeSupport: jest.fn(),
                    changeSupportChat: jest.fn(),
                    changeSupportEmail: jest.fn(),
                    saveStoreConfigurations: jest.fn(),
                    migrateToNewPricing: jest.fn(),
                    endTrial: jest.fn(),
                    activation: jest.fn(),
                })

                mockUseStoreConfigurations.mockReturnValue({
                    storeConfigurations: [
                        storeConfigWithOptIn,
                        storeConfigWithOptOut,
                    ],
                    storeNames: ['Store with OptIn', 'Store with OptOut'],
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantTrialAccess(),
                )

                expect(result.current.hasAnyTrialOptedOut).toBe(true)
            })
        })

        describe('when revamp trial is disabled', () => {
            it('should always return hasOptedOut: false regardless of store configurations', () => {
                mockUseSalesTrialRevampMilestone.mockReturnValue('off')

                const storeConfigurationsWithOptIn = [
                    getStoreConfigurationFixture({
                        storeName: 'Test Store',
                        shopType: 'shopify',
                        monitoredChatIntegrations: [1, 2],
                        sales: {
                            trial: {
                                account: {
                                    plannedUpgradeDatetime: null,
                                    optInDatetime: '2023-11-01T00:00:00.000Z',
                                    optOutDatetime: '2023-11-02T00:00:00.000Z',
                                    actualUpgradeDatetime: null,
                                    actualTerminationDatetime: null,
                                },
                                startDatetime: null,
                                endDatetime: null,
                            },
                        },
                    }),
                ]

                mockUseStoreConfigurations.mockReturnValue({
                    storeConfigurations: storeConfigurationsWithOptIn,
                    storeNames: ['Test Store'],
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantTrialAccess(),
                )

                expect(result.current.hasAnyTrialOptedOut).toBe(false)
            })
        })

        describe('edge cases', () => {
            it('should handle empty store configurations', () => {
                mockUseStoreConfigurations.mockReturnValue({
                    storeConfigurations: [],
                    storeNames: [],
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantTrialAccess(),
                )

                expect(result.current.hasAnyTrialOptedOut).toBe(false)
            })

            it('should handle store configurations without sales data', () => {
                const storeConfigurationsWithoutSales = [
                    getStoreConfigurationFixture({
                        storeName: 'Test Store',
                        shopType: 'shopify',
                        monitoredChatIntegrations: [1, 2],
                        sales: undefined,
                    }),
                ]

                mockUseStoreConfigurations.mockReturnValue({
                    storeConfigurations: storeConfigurationsWithoutSales,
                    storeNames: ['Test Store'],
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantTrialAccess(),
                )

                expect(result.current.hasAnyTrialOptedOut).toBe(false)
            })

            it('should handle store configurations with incomplete trial data', () => {
                const storeConfigurationsWithIncompleteData = [
                    getStoreConfigurationFixture({
                        storeName: 'Test Store',
                        shopType: 'shopify',
                        monitoredChatIntegrations: [1, 2],
                        sales: {
                            trial: {
                                startDatetime: null,
                                endDatetime: null,
                                account: {
                                    plannedUpgradeDatetime: null,
                                    optInDatetime: null,
                                    optOutDatetime: null,
                                    actualUpgradeDatetime: null,
                                    actualTerminationDatetime: null,
                                },
                            },
                        },
                    }),
                ]

                mockUseStoreConfigurations.mockReturnValue({
                    storeConfigurations: storeConfigurationsWithIncompleteData,
                    storeNames: ['Test Store'],
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantTrialAccess(),
                )

                expect(result.current.hasAnyTrialOptedOut).toBe(false)
            })
        })
    })
})
