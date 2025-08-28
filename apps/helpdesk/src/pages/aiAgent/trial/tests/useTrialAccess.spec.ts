import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { HelpdeskPlanTier } from 'models/billing/types'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import {
    useStoreActivations,
    useStoreConfigurations,
} from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

import { createMockTrialAccess } from '../hooks/fixtures'
import { useTrialAccess } from '../hooks/useTrialAccess'

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

const mockIsAdmin = jest.requireMock('utils').isAdmin
const mockIsTeamLead = jest.requireMock('utils').isTeamLead

const defaultExpectedValues = {
    ...createMockTrialAccess(),
    currentAutomatePlan: {
        generation: 5,
    },
}

describe('useTrialAccess', () => {
    const mockUser = fromJS({
        id: 1,
        email: 'test@example.com',
        role: 'admin',
    })

    const mockAccount = fromJS({
        id: 123,
        domain: 'test-account',
    })

    // Base store configuration without any special settings
    const mockBaseStoreConfiguration = getStoreConfigurationFixture({
        storeName: 'Test Store',
        shopType: 'shopify',
        trialModeActivatedDatetime: null,
        monitoredChatIntegrations: [1, 2],
        sales: undefined, // No sales trial data
    })

    // Store configuration with active AI agent channels
    const mockStoreWithActiveChannels = getStoreConfigurationFixture({
        ...mockBaseStoreConfiguration,
        chatChannelDeactivatedDatetime: null, // Active chat channel
        emailChannelDeactivatedDatetime: null, // Active email channel
    })

    // Store configuration with opt-out trial data
    const mockStoreWithOptOut = getStoreConfigurationFixture({
        ...mockBaseStoreConfiguration,
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

    // Store configuration with opt-in trial data
    const mockStoreWithOptIn = getStoreConfigurationFixture({
        ...mockBaseStoreConfiguration,
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

    // Base store activations - AI Agent active (both channels enabled by default)
    const mockStoreActivations = {
        'Test Store': storeActivationFixture({
            storeName: 'Test Store',
            configuration: {
                ...mockBaseStoreConfiguration,
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
            },
        }),
    }

    // Store activations with opt-out
    const mockStoreActivationsWithOptOut = {
        'Test Store': {
            ...storeActivationFixture({ storeName: 'Test Store' }),
            configuration: mockStoreWithOptOut,
        },
    }

    // Store activations with mixed statuses
    const mockStoreActivationsWithMixedStatuses = {
        'Store with OptIn': {
            ...storeActivationFixture({ storeName: 'Store with OptIn' }),
            configuration: mockStoreWithOptIn,
        },
        'Store with OptOut': {
            ...storeActivationFixture({ storeName: 'Store with OptOut' }),
            configuration: mockStoreWithOptOut,
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()

        // Default mock implementations - AiAgentExpandingTrialExperienceForAll disabled by default
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiShoppingAssistantTrialMerchants]: true,
            [FeatureFlagKey.AiAgentExpandingTrialExperienceForAll]: false,
        })

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
            storeConfigurations: [mockStoreWithActiveChannels],
            storeNames: ['Test Store'],
            isLoading: false,
        })
        mockIsAdmin.mockReturnValue(true)
        mockIsTeamLead.mockReturnValue(false)
    })

    describe('when all conditions are met for trial access', () => {
        it('should return correct access values for admin user on starter plan', () => {
            const { result } = renderHook(() => useTrialAccess())

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: true, // Has AI Agent on chat + all other conditions
                canSeeTrialCTA: true,
                hasAiAgentEnabledInCurrentStore: undefined, // No store name provided
                isAdminUser: true,
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

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: true,
                canSeeTrialCTA: true,
                hasAiAgentEnabledInCurrentStore: undefined, // No store name provided
                isAdminUser: true,
            })
        })
        it('should not show trial CTA while data is loading', () => {
            // Set up admin user on starter plan
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

            // Enable feature flags
            mockUseFlags.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantTrialMerchants]: true,
                [FeatureFlagKey.AiAgentExpandingTrialExperienceForAll]: false,
            })

            // Set loading state for store configurations
            mockUseStoreConfigurations.mockReturnValue({
                storeConfigurations: [], // Empty while loading
                storeNames: [],
                isLoading: true,
            })

            // Set loading state for store activations
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {}, // Empty while loading
                progressPercentage: 0,
                isFetchLoading: true,
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

            // Set admin role
            mockIsAdmin.mockReturnValue(true)
            mockIsTeamLead.mockReturnValue(false)

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                hasAiAgentEnabledInCurrentStore: undefined,
                isAdminUser: true,
                isLoading: true,
            })
        })
        it('should return correct access values for team lead user', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(true)

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canNotifyAdmin: true, // Team lead can notify admin
                canSeeSystemBanner: false, // Only admins can see system banner
                canSeeTrialCTA: false, // Only admins can see trial CTA
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
            const { result } = renderHook(() => useTrialAccess())

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: false, // System banner only for Starter/Basic
                canSeeTrialCTA: true, // Pro+ with feature flag can see trial CTA
                isAdminUser: true,
            })
        })

        it('should allow Pro+ admin to book demo when feature flag is disabled', () => {
            mockUseFlags.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantTrialMerchants]: false,
                [FeatureFlagKey.AiAgentExpandingTrialExperienceForAll]: false,
            })

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canBookDemo: true, // Pro+ without feature flag can book demo
                isAdminUser: true,
            })
        })

        it('should allow Pro+ team lead to notify admin when feature flag is enabled', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(true)

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canNotifyAdmin: true, // Team lead can notify for Pro+ with feature flag
            })
        })
    })

    describe('AI Agent activation status', () => {
        it('should return true when both chat and email channels are active', () => {
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {
                    'Test Store': storeActivationFixture({
                        storeName: 'Test Store',
                        configuration: {
                            ...mockBaseStoreConfiguration,
                            chatChannelDeactivatedDatetime: null, // Active
                            emailChannelDeactivatedDatetime: null, // Active
                        },
                    }),
                },
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

            const { result } = renderHook(() => useTrialAccess('Test Store'))

            expect(result.current.hasAiAgentEnabledInCurrentStore).toBe(true)
        })

        it('should return true when only chat channel is active', () => {
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {
                    'Test Store': storeActivationFixture({
                        storeName: 'Test Store',
                        configuration: {
                            ...mockBaseStoreConfiguration,
                            chatChannelDeactivatedDatetime: null, // Active
                            emailChannelDeactivatedDatetime:
                                '2024-01-01T00:00:00Z', // Inactive
                        },
                    }),
                },
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

            const { result } = renderHook(() => useTrialAccess('Test Store'))

            expect(result.current.hasAiAgentEnabledInCurrentStore).toBe(true)
        })

        it('should return true when only email channel is active', () => {
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {
                    'Test Store': storeActivationFixture({
                        storeName: 'Test Store',
                        configuration: {
                            ...mockBaseStoreConfiguration,
                            chatChannelDeactivatedDatetime:
                                '2024-01-01T00:00:00Z', // Inactive
                            emailChannelDeactivatedDatetime: null, // Active
                        },
                    }),
                },
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

            const { result } = renderHook(() => useTrialAccess('Test Store'))

            expect(result.current.hasAiAgentEnabledInCurrentStore).toBe(true)
        })

        it('should return false when both channels are inactive', () => {
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {
                    'Test Store': storeActivationFixture({
                        storeName: 'Test Store',
                        configuration: {
                            ...mockBaseStoreConfiguration,
                            chatChannelDeactivatedDatetime:
                                '2024-01-01T00:00:00Z', // Inactive
                            emailChannelDeactivatedDatetime:
                                '2024-01-01T00:00:00Z', // Inactive
                        },
                    }),
                },
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

            const { result } = renderHook(() => useTrialAccess('Test Store'))

            expect(result.current.hasAiAgentEnabledInCurrentStore).toBe(false)
        })

        it('should return undefined when no current store is provided', () => {
            const { result } = renderHook(() => useTrialAccess())

            expect(
                result.current.hasAiAgentEnabledInCurrentStore,
            ).toBeUndefined()
        })

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

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: false, // No AI Agent on chat
                canSeeTrialCTA: true, // Trial CTA doesn't require AI Agent on chat
                hasAiAgentEnabledInCurrentStore: undefined, // No store name provided
                isAdminUser: true,
            })
        })
    })

    describe('when trial history exists', () => {
        it('should not show trial CTA when trial has expired', () => {
            // Set up store configuration with expired trial
            const storeConfigWithExpiredTrial = getStoreConfigurationFixture({
                storeName: 'Test Store',
                shopType: 'shopify',
                monitoredChatIntegrations: [1, 2],
                sales: {
                    trial: {
                        startDatetime: '2023-11-01T00:00:00.000Z',
                        endDatetime: '2023-12-01T00:00:00.000Z', // Trial ended
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: '2023-11-01T00:00:00.000Z',
                            optOutDatetime: null,
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime:
                                '2023-12-01T00:00:00.000Z',
                        },
                    },
                },
            })

            mockUseStoreConfigurations.mockReturnValue({
                storeConfigurations: [storeConfigWithExpiredTrial],
                storeNames: ['Test Store'],
                isLoading: false,
            })

            mockUseStoreActivations.mockReturnValue({
                storeActivations: {
                    'Test Store': {
                        ...storeActivationFixture({ storeName: 'Test Store' }),
                        configuration: storeConfigWithExpiredTrial,
                    },
                },
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

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeTrialCTA: false, // Trial CTA should not be shown
                hasAiAgentEnabledInCurrentStore: undefined,
                hasAnyTrialExpired: true, // Trial has expired
                hasAnyTrialStarted: true,
                hasAnyTrialOptedIn: true,
                isAdminUser: true,
            })
        })

        it('should currently allow access since trial history check is placeholder', () => {
            // NOTE: This test documents current behavior with placeholder trial history
            // Once proper trial history API is implemented, this test should be updated
            // to expect false values when hasAlreadyCompletedTrial is true
            const { result } = renderHook(() => useTrialAccess())

            // With placeholder (hasAlreadyCompletedTrial = false), all conditions pass
            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: true,
                canSeeTrialCTA: true,
                hasAiAgentEnabledInCurrentStore: undefined, // No store name provided
                isAdminUser: true,
            })
        })
    })

    describe('user role restrictions', () => {
        it('should return false for non-admin, non-team-lead users', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(false)

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current).toEqual(defaultExpectedValues)
        })
    })

    describe('hasOptedOut scenarios', () => {
        beforeEach(() => {
            // Reset to default admin user on starter plan for these tests
            mockIsAdmin.mockReturnValue(true)
            mockIsTeamLead.mockReturnValue(false)

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
                    storeConfigurations: [mockStoreWithOptOut],
                    storeNames: ['Test Store'],
                    isLoading: false,
                })

                const { result } = renderHook(() => useTrialAccess())

                expect(result.current).toEqual({
                    ...defaultExpectedValues,
                    canSeeSystemBanner: true,
                    canSeeTrialCTA: true,
                    hasAnyTrialOptedOut: true,
                    isAdminUser: true,
                })
            })

            it('should return hasOptedOut: true when at least one store has opted out', () => {
                mockUseStoreActivations.mockReturnValue({
                    storeActivations: mockStoreActivationsWithMixedStatuses,
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
                        mockStoreWithOptIn,
                        mockStoreWithOptOut,
                    ],
                    storeNames: ['Store with OptIn', 'Store with OptOut'],
                    isLoading: false,
                })

                const { result } = renderHook(() => useTrialAccess())

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

                const { result } = renderHook(() => useTrialAccess())

                expect(result.current.hasAnyTrialOptedOut).toBe(true)
            })
        })

        describe('edge cases', () => {
            it('should handle empty store configurations', () => {
                mockUseStoreConfigurations.mockReturnValue({
                    storeConfigurations: [],
                    storeNames: [],
                    isLoading: false,
                })

                const { result } = renderHook(() => useTrialAccess())

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

                const { result } = renderHook(() => useTrialAccess())

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

                const { result } = renderHook(() => useTrialAccess())

                expect(result.current.hasAnyTrialOptedOut).toBe(false)
            })
        })
    })

    describe('trialType determination', () => {
        beforeEach(() => {
            // Reset to default admin user on starter plan
            mockIsAdmin.mockReturnValue(true)
            mockIsTeamLead.mockReturnValue(false)

            // Default store configurations
            mockUseStoreConfigurations.mockReturnValue({
                storeConfigurations: [
                    getStoreConfigurationFixture({
                        storeName: 'Test Store',
                        shopType: 'shopify',
                    }),
                ],
                storeNames: ['Test Store'],
                isLoading: false,
            })
        })

        it('should return ShoppingAssistant when AiAgentExpandingTrialExperienceForAll flag is disabled', () => {
            mockUseFlags.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantTrialMerchants]: true,
                [FeatureFlagKey.AiAgentExpandingTrialExperienceForAll]: false,
            })

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current.trialType).toBe(TrialType.ShoppingAssistant)
        })

        it('should return AiAgent when no automate plan exists (USD-4)', () => {
            mockUseFlags.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantTrialMerchants]: true,
                [FeatureFlagKey.AiAgentExpandingTrialExperienceForAll]: true,
            })

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getCurrentUser) {
                    return mockUser
                }
                if (selector === getCurrentAutomatePlan) {
                    return undefined // No automate plan (USD-4)
                }
                if (selector === getCurrentHelpdeskPlan) {
                    return { tier: HelpdeskPlanTier.STARTER }
                }
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                return undefined
            })

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current.trialType).toBe(TrialType.AiAgent)
        })

        it('should return ShoppingAssistant for all other cases', () => {
            mockUseFlags.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantTrialMerchants]: true,
                [FeatureFlagKey.AiAgentExpandingTrialExperienceForAll]: true,
            })

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getCurrentUser) {
                    return mockUser
                }
                if (selector === getCurrentAutomatePlan) {
                    return { generation: 5 } // USD-5 plan
                }
                if (selector === getCurrentHelpdeskPlan) {
                    return { tier: HelpdeskPlanTier.STARTER }
                }
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                return undefined
            })

            const { result } = renderHook(() => useTrialAccess())

            expect(result.current.trialType).toBe(TrialType.ShoppingAssistant)
        })
    })
})
