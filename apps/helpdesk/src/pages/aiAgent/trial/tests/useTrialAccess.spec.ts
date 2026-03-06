import React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'

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
    OnboardingState,
    useAiAgentOnboardingState,
} from 'pages/aiAgent/hooks/useAiAgentOnboardingState'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import {
    getCurrentAccountState,
    isTrialing,
} from 'state/currentAccount/selectors'
import { CompanyTier } from 'state/currentCompany/currentCompanySlice'
import { getCompanyFixedGmvBandTier } from 'state/currentCompany/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

import { createMockTrialAccess } from '../hooks/fixtures'
import {
    gmvBandsAllowedToBookDemo,
    gmvBandsAllowedToSelfServe,
    useTrialAccess,
} from '../hooks/useTrialAccess'

// Mock dependencies
jest.mock('hooks/useAppSelector')
jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('../hooks/useSalesTrialRevampMilestone')
jest.mock('models/aiAgent/queries')
jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingState')

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
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
const mockUseAiAgentOnboardingState = assumeMock(useAiAgentOnboardingState)

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
    isAdminUser: true,
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

    type Selector = Parameters<typeof useAppSelector>[0]
    const defaulUseAppSelectorMockImplementation = (selector: Selector) => {
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
        if (selector === isTrialing) {
            return false
        }
        if (selector === getCompanyFixedGmvBandTier) {
            return CompanyTier.Band1 // SMB
        }
        return undefined
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                false,
        )

        mockUseAppSelector.mockImplementation(
            defaulUseAppSelectorMockImplementation,
        )

        mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(false)
        mockUseStoreActivations.mockReturnValue({
            storeActivations: mockStoreActivations,
            allStoreActivations: mockStoreActivations,
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
        mockUseAiAgentOnboardingState.mockReturnValue(
            OnboardingState.OnboardingWizard,
        )
    })

    describe('gmv segmentation', () => {
        beforeEach(() => {
            mockUseFlag.mockClear() // Clear the default
            mockUseFlag.mockImplementation(() => false) // Don't forcibly allow user be in trial
        })

        it.each(Object.values(CompanyTier))(
            'should only allow SMB and Commerical GMV tiers to see the trial CTA (tier: %s)',
            (tier: CompanyTier) => {
                mockUseAppSelector.mockClear() // Clear the default
                mockUseAppSelector.mockImplementation((selector) => {
                    if (selector === getCompanyFixedGmvBandTier) {
                        return tier
                    }
                    return defaulUseAppSelectorMockImplementation(selector)
                })

                const { result } = renderUseTrialAccess()

                expect(result.current.canSeeTrialCTA).toEqual(
                    gmvBandsAllowedToSelfServe.includes(tier),
                )
            },
        )

        it.each(Object.values(CompanyTier))(
            'should only allow SMB and Commerical GMV tiers to see the subscribe now CTA (tier: %s)',
            (tier: CompanyTier) => {
                const expiredTrial = createMockTrial({
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
                })

                mockUseGetTrials.mockReturnValue({
                    data: [expiredTrial],
                    isLoading: false,
                    error: null,
                    isError: false,
                    isSuccess: true,
                    status: 'success',
                } as any)

                mockUseAppSelector.mockClear() // Clear the default
                mockUseAppSelector.mockImplementation((selector) => {
                    if (selector === getCompanyFixedGmvBandTier) {
                        return tier
                    }
                    return defaulUseAppSelectorMockImplementation(selector)
                })

                const { result } = renderUseTrialAccess('Test Store')

                expect(result.current.canSeeSubscribeNowCTA).toEqual(
                    gmvBandsAllowedToSelfServe.includes(tier),
                )
            },
        )

        it.each(Object.values(CompanyTier))(
            'should only allow Commerical and Enterprise GMV tiers to book demos (tier: %s)',
            (tier: CompanyTier) => {
                mockUseAppSelector.mockClear() // Clear the default
                mockUseAppSelector.mockImplementation((selector) => {
                    if (selector === getCompanyFixedGmvBandTier) {
                        return tier
                    }
                    return defaulUseAppSelectorMockImplementation(selector)
                })

                const { result } = renderUseTrialAccess()

                expect(result.current.canBookDemo).toEqual(
                    gmvBandsAllowedToBookDemo.includes(tier),
                )
            },
        )
    })

    describe('when all conditions are met for trial access', () => {
        it('should return correct access values for admin user on starter plan', () => {
            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: true, // Has AI Agent on chat + all other conditions
                canSeeTrialCTA: true,
            })
        })

        it('should return correct access values for admin user on basic plan', () => {
            mockUseAppSelector.mockClear() // Clear the default
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getCurrentHelpdeskPlan) {
                    return { tier: HelpdeskPlanTier.BASIC }
                }
                return defaulUseAppSelectorMockImplementation(selector)
            })

            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: true,
                canSeeTrialCTA: true,
                isTrialingSubscription: false,
            })
        })

        it('should not show trial CTA while data is loading', () => {
            // Enable feature flags
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                    false,
            )

            // Set loading state for useGetTrials
            mockUseGetTrials.mockReturnValue({
                data: [],
                isLoading: true,
                error: null,
                isError: false,
            } as any)

            // Set loading state for store activations
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {},
                allStoreActivations: {},
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
                canSeeSystemBanner: true,
                canSeeTrialCTA: false,
                isLoading: true,
                isTrialingSubscription: false,
            })
        })

        it('should not show subscribe now CTA while data is loading', () => {
            // Enable feature flags
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                    false,
            )

            // Set loading state for useGetTrials
            mockUseGetTrials.mockReturnValue({
                data: [],
                isLoading: true,
                error: null,
                isError: false,
            } as any)

            // Set loading state for store activations
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {},
                allStoreActivations: {},
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
                canSeeSystemBanner: true,
                canSeeSubscribeNowCTA: false,
                isLoading: true,
                isTrialingSubscription: false,
            })
        })

        it('should return correct access values for team lead user', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(true)

            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canNotifyAdmin: true, // Team lead can notify admin
                canSeeSystemBanner: true, // Both admins and team leads can see system banner
                canSeeTrialCTA: false, // Only admins can see trial CTA
                isAdminUser: false,
            })
        })
    })

    describe('when user is on Pro+ plan', () => {
        beforeEach(() => {
            mockUseAppSelector.mockClear() // Clear the default
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getCurrentHelpdeskPlan) {
                    return { tier: HelpdeskPlanTier.PRO }
                }
                return defaulUseAppSelectorMockImplementation(selector)
            })
        })

        it('should allow Pro+ admin to see trial CTA when feature flag is enabled', () => {
            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canSeeSystemBanner: true, // System banner for everyone
                canSeeTrialCTA: true, // Pro+ with feature flag can see trial CTA
                isTrialingSubscription: false,
            })
        })

        it('should allow Pro+ team lead to notify admin when feature flag is enabled', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(true)

            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                canNotifyAdmin: true, // Team lead can notify for Pro+ with feature flag
                canSeeSystemBanner: true, // Both admins and team leads can see system banner
                isTrialingSubscription: false,
                isAdminUser: false,
            })
        })
    })

    describe('when trial history exists', () => {
        it('should subscribe now CTA when current store trial has expired', () => {
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
                canSeeSubscribeNowCTA: true, // Subscribe should now be shown
                hasAnyTrialExpired: true, // Trial has expired
                hasAnyTrialStarted: true,
                hasAnyTrialOptedIn: true,
                hasCurrentStoreTrialExpired: true,
                hasCurrentStoreTrialStarted: true,
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
            })
        })
    })

    describe('user role restrictions', () => {
        it('should return false for non-admin, non-team-lead users', () => {
            mockIsAdmin.mockReturnValue(false)
            mockIsTeamLead.mockReturnValue(false)

            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                isAdminUser: false,
            })
        })
    })

    describe('hasOptedOut scenarios', () => {
        beforeEach(() => {
            // Reset to default admin user on starter plan for these tests
            mockIsAdmin.mockReturnValue(true)
            mockIsTeamLead.mockReturnValue(false)
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

        it('should return AiAgent when no automate plan exists (USD-4)', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantTrialMerchants ||
                    false,
            )

            mockUseAppSelector.mockClear() // Clear the default
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === getCurrentAutomatePlan) {
                    return undefined // No automate plan (USD-4)
                }
                return defaulUseAppSelectorMockImplementation(selector)
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

            const { result } = renderUseTrialAccess()

            expect(result.current.trialType).toBe(TrialType.ShoppingAssistant)
        })
    })

    describe('isOnboarded property', () => {
        it('should return isOnboarded: true when onboarding state is Onboarded', () => {
            mockUseAiAgentOnboardingState.mockReturnValue(
                OnboardingState.Onboarded,
            )

            const { result } = renderUseTrialAccess('Test Store')

            expect(result.current.isOnboarded).toBe(true)
        })

        it('should return isOnboarded: false when onboarding state is OnboardingWizard', () => {
            mockUseAiAgentOnboardingState.mockReturnValue(
                OnboardingState.OnboardingWizard,
            )

            const { result } = renderUseTrialAccess('Test Store')

            expect(result.current.isOnboarded).toBe(false)
        })

        it('should return isOnboarded: undefined when onboarding state is Loading', () => {
            mockUseAiAgentOnboardingState.mockReturnValue(
                OnboardingState.Loading,
            )

            const { result } = renderUseTrialAccess('Test Store')

            expect(result.current.isOnboarded).toBe(undefined)
        })
    })

    describe('when account is trialing subscription', () => {
        beforeEach(() => {
            // Reset to default admin user
            mockIsAdmin.mockReturnValue(true)
            mockIsTeamLead.mockReturnValue(false)

            // Set up trialing subscription
            mockUseAppSelector.mockClear() // Clear the default
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === isTrialing) {
                    return true
                }
                return defaulUseAppSelectorMockImplementation(selector)
            })
        })

        it('should return restricted access regardless of the helpdesk or automate plan', () => {
            const { result } = renderUseTrialAccess()

            expect(result.current).toEqual({
                ...defaultExpectedValues,
                isTrialingSubscription: true,
                isError: undefined,
            })
        })
    })
})
