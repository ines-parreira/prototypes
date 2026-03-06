import { useFlag } from '@repo/feature-flags'
import * as segment from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { useHistory, useLocation } from 'react-router-dom'

import type { ContextBanner } from 'AlertBanners'
import { AlertBannerTypes, BannerCategories } from 'AlertBanners'
import { user } from 'fixtures/users'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'

import { useShoppingAssistantTrialBanner } from '../hooks/useShoppingAssistantTrialBanner'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: jest.fn(),
    useLocation: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')

const mockUseLocation = assumeMock(useLocation)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseTrialAccess = assumeMock(useTrialAccess)

const mockedAddBanner = jest.fn<unknown, [ContextBanner]>()
const mockedRemoveBanner = jest.fn()
const mockPush = jest.fn()
const mockHistory = { push: mockPush }
const mockLogEvent = jest.spyOn(segment, 'logEvent').mockImplementation(jest.fn)

jest.mock(
    'AlertBanners',
    () =>
        ({
            ...jest.requireActual('AlertBanners'),
            useBanners: () => ({
                addBanner: mockedAddBanner,
                removeBanner: mockedRemoveBanner,
            }),
        }) as Record<string, unknown>,
)

const mockShopName = 'test-store'

const mockAccount = fromJS({
    id: 123,
    domain: 'test-domain',
})

const mockUser = fromJS(user)

describe('useShoppingAssistantTrialBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        // Mock useHistory similar to reference file
        ;(useHistory as jest.Mock).mockReturnValue(mockHistory)

        mockUseLocation.mockReturnValue({
            pathname: '/app/dashboard',
            search: '',
            state: undefined,
            hash: '',
        })

        mockUseFlag.mockReturnValue(false)

        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAccountState) {
                return mockAccount
            }
            if (selector === getCurrentUser) {
                return mockUser
            }
            if (selector === getRoleName) {
                return 'admin'
            }
            return undefined
        })

        mockUseStoreActivations.mockReturnValue({
            storeActivations: {
                [mockShopName]: {
                    name: mockShopName,
                    title: mockShopName,
                    alerts: [],
                    sales: {
                        enabled: false,
                        isDisabled: false,
                    },
                    support: {
                        enabled: true,
                        chat: {
                            enabled: false,
                        },
                        email: {
                            enabled: false,
                        },
                    },
                    configuration: getStoreConfigurationFixture({
                        storeName: mockShopName,
                        shopType: 'shopify',
                    }),
                },
            },
            allStoreActivations: {},
            isFetchLoading: false,
        } as any)

        mockUseTrialAccess.mockReturnValue(createMockTrialAccess())
    })

    describe('when banner should not be shown', () => {
        it('should not add banner when on tickets page', () => {
            mockUseLocation.mockReturnValue({
                pathname: '/app/tickets',
                search: '',
                state: undefined,
                hash: '',
            })

            mockUseFlag.mockReturnValue(false)
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeSystemBanner: true,
                }),
            )

            renderHook(() => useShoppingAssistantTrialBanner())

            expect(mockedAddBanner).not.toHaveBeenCalled()
            expect(mockedRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )
        })

        it('should not add banner when on views page', () => {
            mockUseLocation.mockReturnValue({
                pathname: '/app/views/inbox',
                search: '',
                state: undefined,
                hash: '',
            })

            mockUseFlag.mockReturnValue(false)
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeSystemBanner: true,
                }),
            )

            renderHook(() => useShoppingAssistantTrialBanner())

            expect(mockedAddBanner).not.toHaveBeenCalled()
            expect(mockedRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )
        })

        it('should not add banner when canSeeSystemBanner is false', () => {
            mockUseFlag.mockReturnValue(false)

            renderHook(() => useShoppingAssistantTrialBanner())

            expect(mockedAddBanner).not.toHaveBeenCalled()
            expect(mockedRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )
        })

        it('should not add banner when trial access hook returns false', () => {
            renderHook(() => useShoppingAssistantTrialBanner())

            expect(mockedAddBanner).not.toHaveBeenCalled()
            expect(mockedRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )
        })
    })

    describe('when banner should be shown', () => {
        beforeEach(() => {
            mockUseLocation.mockReturnValue({
                pathname: '/app/dashboard',
                search: '',
                state: undefined,
                hash: '',
            })

            mockUseFlag.mockReturnValue(false)
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeSystemBanner: true,
                }),
            )
        })

        it('should add trial banner with correct configuration', () => {
            renderHook(() => useShoppingAssistantTrialBanner())

            expect(mockedAddBanner).toHaveBeenCalledWith({
                preventDismiss: false,
                category: BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                instanceId: BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                type: AlertBannerTypes.Info,
                message:
                    'AI Agent just got even smarter with brand new Shopping Assistant skills, start your exclusive access to a 14-day trial',
                CTA: {
                    type: 'internal',
                    text: 'Get Started',
                    to: '/app/ai-agent/shopify/test-store/sales',
                    onClick: expect.any(Function),
                },
            })
        })

        it('should not add banner when AB testing flag is enabled', () => {
            mockUseFlag.mockReturnValue(true)

            renderHook(() => useShoppingAssistantTrialBanner())

            expect(mockedAddBanner).not.toHaveBeenCalled()
            expect(mockedRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )
        })

        it('should log display event when banner is shown', () => {
            renderHook(() => useShoppingAssistantTrialBanner())

            expect(mockLogEvent).toHaveBeenCalledWith(
                segment.SegmentEvent.TrialSystemWideBannerViewed,
                {
                    accountId: 123,
                    userId: 2,
                    userRole: 'admin',
                    type: 'system-banner',
                    trialType: 'shoppingAssistant',
                },
            )
        })

        it('should not remove banner when it should be shown', () => {
            renderHook(() => useShoppingAssistantTrialBanner())

            expect(mockedRemoveBanner).not.toHaveBeenCalled()
        })
    })

    describe('effect dependencies', () => {
        it('should re-evaluate when isOnEligiblePlan changes from false to true', () => {
            // Initially not eligible
            const { rerender } = renderHook(() =>
                useShoppingAssistantTrialBanner(),
            )

            expect(mockedAddBanner).not.toHaveBeenCalled()
            expect(mockedRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )

            // Clear mocks
            mockedAddBanner.mockClear()
            mockedRemoveBanner.mockClear()

            // Make eligible
            mockUseFlag.mockReturnValue(false)
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeSystemBanner: true,
                }),
            )

            rerender()

            expect(mockedAddBanner).toHaveBeenCalled()
            expect(mockedRemoveBanner).not.toHaveBeenCalled()
        })

        it('should re-evaluate when isOnEligiblePlan changes from true to false', () => {
            // Initially eligible
            mockUseFlag.mockReturnValue(false)
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeSystemBanner: true,
                }),
            )

            const { rerender } = renderHook(() =>
                useShoppingAssistantTrialBanner(),
            )

            expect(mockedAddBanner).toHaveBeenCalled()
            expect(mockedRemoveBanner).not.toHaveBeenCalled()

            // Clear mocks
            mockedAddBanner.mockClear()
            mockedRemoveBanner.mockClear()

            // // Make not eligible
            mockUseTrialAccess.mockReturnValue(createMockTrialAccess())

            rerender()

            expect(mockedAddBanner).not.toHaveBeenCalled()
            expect(mockedRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )
        })
    })

    describe('location-based behavior', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    canSeeSystemBanner: true,
                }),
            )
        })

        it('should remove banner when navigating to tickets page', () => {
            // Start on eligible page
            mockUseLocation.mockReturnValue({
                pathname: '/app/dashboard',
                search: '',
                state: undefined,
                hash: '',
            })

            const { rerender } = renderHook(() =>
                useShoppingAssistantTrialBanner(),
            )

            expect(mockedAddBanner).toHaveBeenCalled()

            // Clear mocks and navigate to tickets
            mockedAddBanner.mockClear()
            mockedRemoveBanner.mockClear()

            mockUseLocation.mockReturnValue({
                pathname: '/app/tickets',
                search: '',
                state: undefined,
                hash: '',
            })

            rerender()

            expect(mockedAddBanner).not.toHaveBeenCalled()
            expect(mockedRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )
        })

        it('should remove banner when navigating to views page', () => {
            // Start on eligible page
            mockUseLocation.mockReturnValue({
                pathname: '/app/dashboard',
                search: '',
                state: undefined,
                hash: '',
            })

            const { rerender } = renderHook(() =>
                useShoppingAssistantTrialBanner(),
            )

            expect(mockedAddBanner).toHaveBeenCalled()

            // Clear mocks and navigate to views
            mockedAddBanner.mockClear()
            mockedRemoveBanner.mockClear()

            mockUseLocation.mockReturnValue({
                pathname: '/app/views/all-tickets',
                search: '',
                state: undefined,
                hash: '',
            })

            rerender()

            expect(mockedAddBanner).not.toHaveBeenCalled()
            expect(mockedRemoveBanner).toHaveBeenCalledWith(
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
                BannerCategories.AI_SHOPPING_ASSISTANT_TRIAL_REVAMP,
            )
        })
    })
})
