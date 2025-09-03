import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'
import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useGetTrials } from 'models/aiAgent/queries'
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
jest.mock('hooks/useAppSelector')
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('../hooks/useSalesTrialRevampMilestone')
jest.mock('models/aiAgent/queries')

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

// Mock utility functions
jest.mock('utils', () => ({
    ...jest.requireActual('utils'),
    createImmutableSelector: () => jest.fn(),
    isAdmin: jest.fn(),
    isTeamLead: jest.fn(),
}))

const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseAtLeastOneStoreHasActiveTrial = assumeMock(
    useAtLeastOneStoreHasActiveTrial,
)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseStoreConfigurations = assumeMock(useStoreConfigurations)
const mockUseGetTrials = assumeMock(useGetTrials)

const mockIsAdmin = jest.requireMock('utils').isAdmin
const mockIsTeamLead = jest.requireMock('utils').isTeamLead

const createMockTrial = (overrides = {}) => ({
    shopName: 'Test Store',
    shopType: 'shopify',
    type: TrialType.ShoppingAssistant,
    trial: {
        startDatetime: null,
        endDatetime: null,
        account: {
            optInDatetime: null,
            optOutDatetime: null,
            plannedUpgradeDatetime: null,
            actualUpgradeDatetime: null,
            actualTerminationDatetime: null,
        },
    },
    ...overrides,
})

const defaultExpectedValues = {
    ...createMockTrialAccess(),
    currentAutomatePlan: {
        generation: 5,
    },
}

const renderUseTrialAccess = (currentStoreName?: string) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return renderHook(() => useTrialAccess(currentStoreName), {
        wrapper: ({ children }) =>
            React.createElement(
                QueryClientProvider,
                { client: queryClient },
                children,
            ),
    })
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

    beforeEach(() => {
        jest.clearAllMocks()

        // Default mock implementations - AiAgentExpandingTrialExperienceForAll disabled by default
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                key === FeatureFlagKey.AiAgentExpandingTrialExperienceForAll ||
                false,
        )

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
        mockUseGetTrials.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
            isError: false,
            isSuccess: true,
            status: 'success',
        } as any)
        mockIsAdmin.mockReturnValue(true)
        mockIsTeamLead.mockReturnValue(false)
    })

    describe('when all conditions are met for trial access', () => {
        it('should return correct access values for admin user on starter plan', () => {
            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: true, // Has AI Agent on chat + all other conditions
                canSeeTrialCTA: true,
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

            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: true,
                canSeeTrialCTA: true,
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
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                    false,
            )

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

            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: false,
                canSeeTrialCTA: false,
                isAdminUser: true,
                isLoading: true,
            })
        })
        it('should return correct access values for team lead user', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(true)

            const { result } = renderUseTrialAccess()

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
            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: false, // System banner only for Starter/Basic
                canSeeTrialCTA: true, // Pro+ with feature flag can see trial CTA
                isAdminUser: true,
            })
        })

        it('should allow Pro+ admin to book demo when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canBookDemo: true, // Pro+ without feature flag can book demo
                isAdminUser: true,
            })
        })

        it('should allow Pro+ team lead to notify admin when feature flag is enabled', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(true)

            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canNotifyAdmin: true, // Team lead can notify for Pro+ with feature flag
            })
        })
    })

    describe('AI Agent activation status', () => {
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

            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: false, // No AI Agent on chat
                canSeeTrialCTA: true, // Trial CTA doesn't require AI Agent on chat
                isAdminUser: true,
            })
        })
    })

    describe('when trial history exists', () => {
        it('should not show trial CTA when current store trial has expired', () => {
            const expiredTrial = createMockTrial({
                trial: {
                    startDatetime: '2023-11-01T00:00:00.000Z',
                    endDatetime: '2023-12-01T00:00:00.000Z', // Trial ended
                    account: {
                        plannedUpgradeDatetime: null,
                        optInDatetime: '2023-11-01T00:00:00.000Z',
                        optOutDatetime: null,
                        actualUpgradeDatetime: null,
                        actualTerminationDatetime: '2023-12-01T00:00:00.000Z',
                    },
                },
            })

            mockUseGetTrials.mockReturnValue({
                data: [expiredTrial],
                isLoading: false,
                error: null,
                isError: false,
                isSuccess: true,
                status: 'success',
            } as any)

            const { result } = renderUseTrialAccess('Test Store')

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeTrialCTA: false, // Trial CTA should not be shown
                hasAnyTrialExpired: true, // Trial has expired
                hasAnyTrialStarted: true,
                hasAnyTrialOptedIn: true,
                hasCurrentStoreTrialExpired: true,
                hasCurrentStoreTrialStarted: true,
                isAdminUser: true,
            })
        })

        it('should currently allow access since trial history check is placeholder', () => {
            // NOTE: This test documents current behavior with placeholder trial history
            // Once proper trial history API is implemented, this test should be updated
            // to expect false values when hasAlreadyCompletedTrial is true
            const { result } = renderUseTrialAccess()

            // With placeholder (hasAlreadyCompletedTrial = false), all conditions pass
            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: true,
                canSeeTrialCTA: true,
                isAdminUser: true,
            })
        })
    })

    describe('user role restrictions', () => {
        it('should return false for non-admin, non-team-lead users', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(false)

            const { result } = renderUseTrialAccess()

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
                const optedOutTrial = createMockTrial({
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
                })

                mockUseGetTrials.mockReturnValue({
                    data: [optedOutTrial],
                    isLoading: false,
                    error: null,
                    isError: false,
                    isSuccess: true,
                    status: 'success',
                } as any)

                const { result } = renderUseTrialAccess()

                expect(result.current).toEqual({
                    ...defaultExpectedValues,
                    canSeeSystemBanner: true,
                    canSeeTrialCTA: true,
                    hasAnyTrialOptedOut: true,
                    isAdminUser: true,
                })
            })

            it('should return hasOptedOut: true when at least one store has opted out', () => {
                const optedInTrial = createMockTrial({
                    shopName: 'Store with OptIn',
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
                })

                const optedOutTrial = createMockTrial({
                    shopName: 'Store with OptOut',
                    trial: {
                        startDatetime: null,
                        endDatetime: null,
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: null,
                            optOutDatetime: '2023-11-02T00:00:00.000Z',
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                })

                mockUseGetTrials.mockReturnValue({
                    data: [optedInTrial, optedOutTrial],
                    isLoading: false,
                    error: null,
                    isError: false,
                    isSuccess: true,
                    status: 'success',
                } as any)

                const { result } = renderUseTrialAccess()

                expect(result.current.hasAnyTrialOptedOut).toBe(true)
            })
        })

        describe('when user has opted out with mixed store statuses', () => {
            it('should return hasOptedOut: true when different stores have different statuses', () => {
                const optedInTrial = createMockTrial({
                    shopName: 'Store with OptIn',
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
                })

                const optedOutTrial = createMockTrial({
                    shopName: 'Store with OptOut',
                    trial: {
                        startDatetime: null,
                        endDatetime: null,
                        account: {
                            plannedUpgradeDatetime: null,
                            optInDatetime: null,
                            optOutDatetime: '2023-11-02T00:00:00.000Z',
                            actualUpgradeDatetime: null,
                            actualTerminationDatetime: null,
                        },
                    },
                })

                mockUseGetTrials.mockReturnValue({
                    data: [optedInTrial, optedOutTrial],
                    isLoading: false,
                    error: null,
                    isError: false,
                    isSuccess: true,
                    status: 'success',
                } as any)

                const { result } = renderUseTrialAccess()

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

                const { result } = renderUseTrialAccess()

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

                const { result } = renderUseTrialAccess()

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

                const { result } = renderUseTrialAccess()

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
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                    false,
            )

            const { result } = renderUseTrialAccess()

            expect(result.current.trialType).toBe(TrialType.ShoppingAssistant)
        })

        it('should return AiAgent when no automate plan exists (USD-4)', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                    key ===
                        FeatureFlagKey.AiAgentExpandingTrialExperienceForAll ||
                    false,
            )

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

            const { result } = renderUseTrialAccess()

            expect(result.current.trialType).toBe(TrialType.AiAgent)
        })

        it('should return ShoppingAssistant for all other cases', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                    false,
            )

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

            const { result } = renderUseTrialAccess()

            expect(result.current.trialType).toBe(TrialType.ShoppingAssistant)
        })
    })
})
