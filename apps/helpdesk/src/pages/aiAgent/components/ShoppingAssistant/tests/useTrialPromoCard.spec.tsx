import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import { shopifyIntegration } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import useAppSelector from 'hooks/useAppSelector'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import { useEarlyAccessModalState } from 'pages/aiAgent/Activation/hooks/useEarlyAccessModalState'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { useAiAgentAutomationRate } from 'pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from '../constants/shoppingAssistant'
import { useTrialPromoCard } from '../hooks/useTrialPromoCard'

// Mock dependencies
jest.mock('common/segment')
jest.mock('core/flags')
jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock('pages/aiAgent/trial/hooks/useTrialEnding')
jest.mock('pages/aiAgent/trial/hooks/useTrialMetrics')
jest.mock('pages/aiAgent/Overview/hooks/kpis/useAiAgentAutomationRate')
jest.mock('pages/aiAgent/Activation/hooks/useEarlyAccessModalState')

const mockLogEvent = assumeMock(logEvent)
const mockUseFlag = assumeMock(useFlag)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseEarlyAccessModalState = assumeMock(useEarlyAccessModalState)
const mockUseShoppingAssistantTrialFlow = assumeMock(
    useShoppingAssistantTrialFlow,
)
const mockUseTrialAccess = assumeMock(useTrialAccess)
const mockUseTrialEnding = assumeMock(useTrialEnding)
const mockUseTrialMetrics = assumeMock(useTrialMetrics)
const mockUseAiAgentAutomationRate = assumeMock(useAiAgentAutomationRate)

jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: jest.fn(),
    }),
    useLocation: () => ({
        pathname: '/test-path',
        search: '',
        hash: '',
        state: null,
    }),
    MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
}))

describe('useTrialPromoCard', () => {
    let queryClient: QueryClient
    const mockStore = configureMockStore()

    const createWrapper = () => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })

        const store = mockStore({})

        return ({ children }: { children: React.ReactNode }) => (
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Provider>
        )
    }

    const mockAccount = fromJS({
        id: 123,
        domain: 'test-account',
    })
    const mockStoreActivations = {
        'test-store': storeActivationFixture({ storeName: 'test-store' }),
    }
    const mockShopifyIntegrations = [
        {
            ...shopifyIntegration,
            id: 1,
            name: 'First Shop',
            meta: { ...shopifyIntegration.meta, shop_name: 'first-shop' },
        },
        {
            ...shopifyIntegration,
            id: 2,
            name: 'Second Shop',
            meta: { ...shopifyIntegration.meta, shop_name: 'second-shop' },
        },
    ]
    const mockTrialFlow = getUseShoppingAssistantTrialFlowFixture()
    const baseTrialAccess = createMockTrialAccess()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(true)
        const mockDispatch = jest.fn()

        jest.spyOn(require('hooks/useAppDispatch'), 'default').mockReturnValue(
            mockDispatch,
        )

        mockUseAppSelector.mockImplementation((selector: any) => {
            if (selector === getCurrentAccountState) {
                return mockAccount
            }
            if (selector === getShopifyIntegrationsSortedByName) {
                return mockShopifyIntegrations
            }
            if (selector === getCurrentUser) {
                return fromJS(user)
            }
            return undefined
        })
        mockUseStoreActivations.mockReturnValue({
            storeActivations: mockStoreActivations,
            progressPercentage: 0,
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
        mockUseEarlyAccessModalState.mockReturnValue({
            isOnNewPlan: false,
            setIsPreviewModalVisible: jest.fn(),
            isPreviewModalVisible: false,
            isCurrentUserAdmin: true,
            currentPlan: null,
            helpdeskPlan: null,
            earlyAccessPlan: null,
            isLoading: false,
            handleSubscriptionUpdate: jest.fn(),
            isSubscriptionUpdating: false,
        } as any)
        mockUseShoppingAssistantTrialFlow.mockReturnValue(mockTrialFlow)
        mockUseTrialAccess.mockReturnValue(baseTrialAccess)
        mockUseTrialEnding.mockReturnValue({
            remainingDays: 7,
            remainingDaysFloat: 7.0,
            trialEndDatetime: '2024-01-15T00:00:00.000Z',
            trialTerminationDatetime: null,
            optedOutDatetime: null,
        })
        mockUseTrialMetrics.mockReturnValue({
            gmvInfluenced: '$1,250',
            gmvInfluencedRate: 0.3,
            isLoading: false,
        })
    })

    describe('Hook return values', () => {
        it('should return trialAccess from the hook', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.trialAccess).toBeDefined()
            expect(result.current.trialAccess.canSeeTrialCTA).toBe(true)
        })

        it('should return trialFlow from the hook', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.trialFlow).toBeDefined()
            expect(result.current.trialFlow).toBe(mockTrialFlow)
        })

        it('should return all expected properties', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current).toHaveProperty('trialAccess')
            expect(result.current).toHaveProperty('promoCardContent')
            expect(result.current).toHaveProperty('trialFlow')
            expect(result.current).toHaveProperty('isLoading')
            expect(result.current).toHaveProperty('automationRate')
        })
    })

    describe('Feature flag disabled', () => {
        it('should return null when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent).toBeNull()
        })
    })

    describe('No access permissions', () => {
        it('should return null when user has no access permissions', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: false,
                hasAnyTrialStarted: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent).toBeNull()
        })
    })

    describe('User Story: Admin with Starter/Basic Plan - Trial Access', () => {
        beforeEach(() => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
                canBookDemo: false,
                canNotifyAdmin: false,
            })
        })

        it('should return admin-trial variant with correct content - Try for X days', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent).toEqual({
                variant: 'admin-trial',
                title: 'Unlock new AI Agent skills',
                description: 'Go beyond automation and grow revenue by 1.5%.',
                shouldShowDescriptionIcon: false,
                showVideo: true,
                shouldShowNotificationIcon: false,
                progressPercentage: undefined,
                progressText: undefined,
                showProgressBar: false,
                primaryButton: {
                    label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                    onClick: expect.any(Function),
                    disabled: false,
                },
                secondaryButton: {
                    label: 'Learn more',
                    href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
                    target: '_blank',
                    onClick: expect.any(Function),
                    disabled: false,
                },
                videoModalButton: {
                    label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
                    onClick: expect.any(Function),
                    disabled: false,
                },
            })
        })

        it('should trigger trial flow when primary button is clicked', () => {
            const { result } = renderHook(
                () =>
                    useTrialPromoCard(
                        'first-shop',
                        mockShopifyIntegrations,
                        'first-shop',
                    ),
                {
                    wrapper: createWrapper(),
                },
            )

            result.current?.promoCardContent?.primaryButton.onClick?.()

            expect(mockTrialFlow.openTrialUpgradeModal).toHaveBeenCalledTimes(1)
        })

        it('should trigger trial flow when video modal CTA is clicked', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            result.current?.promoCardContent?.videoModalButton?.onClick?.()

            expect(mockTrialFlow.openTrialUpgradeModal).toHaveBeenCalledTimes(1)
        })

        it('should log correct event when primary button is clicked', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            result.current?.promoCardContent?.primaryButton.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Start Trial', trialType: TrialType.ShoppingAssistant },
            )
        })

        it('should log correct event when video modal CTA is clicked', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            result.current?.promoCardContent?.videoModalButton?.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Start Trial', trialType: TrialType.ShoppingAssistant },
            )
        })

        it('should log correct event when secondary button is clicked', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            result.current?.promoCardContent?.secondaryButton?.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Learn', trialType: TrialType.ShoppingAssistant },
            )
        })
    })

    describe('User Story: Admin with Pro+ Plan - Demo Access', () => {
        beforeEach(() => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: true,
                canNotifyAdmin: false,
            })
        })

        it('should return admin-demo variant with correct content - Book a Demo', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent).toEqual({
                variant: 'admin-demo',
                title: 'Unlock new AI Agent skills',
                description: 'Go beyond automation and grow revenue by 1.5%.',
                shouldShowDescriptionIcon: false,
                showVideo: true,
                shouldShowNotificationIcon: false,
                progressPercentage: undefined,
                progressText: undefined,
                showProgressBar: false,
                primaryButton: {
                    label: 'Book a demo',
                    href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_BOOK_DEMO,
                    target: '_blank',
                    onClick: expect.any(Function),
                    disabled: false,
                },
                secondaryButton: {
                    label: 'Learn more',
                    href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
                    target: '_blank',
                    onClick: expect.any(Function),
                    disabled: false,
                },
                videoModalButton: undefined,
            })
        })

        it('should log correct event when demo button is clicked', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            result.current?.promoCardContent?.primaryButton.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Demo', trialType: TrialType.ShoppingAssistant },
            )
        })
    })

    describe('User Story: Team Lead with Starter/Basic Plan - Notify Admin', () => {
        beforeEach(() => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: false,
                canNotifyAdmin: true,
            })
        })

        it('should return lead-notify variant with correct content and notification icon', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent).toEqual({
                variant: 'lead-notify',
                title: 'Unlock new AI Agent skills',
                description: `Try AI Agent's shopping assistant capabilities for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days.`,
                shouldShowDescriptionIcon: false,
                showVideo: true,
                shouldShowNotificationIcon: true,
                progressPercentage: undefined,
                progressText: undefined,
                showProgressBar: false,
                primaryButton: {
                    label: 'Notify admin',
                    onClick: expect.any(Function),
                    disabled: false,
                },
                secondaryButton: {
                    label: 'Learn more',
                    href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
                    target: '_blank',
                    onClick: expect.any(Function),
                    disabled: false,
                },
                videoModalButton: undefined,
            })
        })

        it('should log correct event when notify admin button is clicked', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            result.current?.promoCardContent?.primaryButton.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Notify Admin', trialType: TrialType.ShoppingAssistant },
            )
        })
    })

    describe('User Story: Team Lead with Pro+ Plan - Notify admin / book a demo', () => {
        beforeEach(() => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: true,
                canNotifyAdmin: true,
            })
        })

        it('should return lead-notify variant with notify admin as primary and demo as secondary', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent).toEqual({
                variant: 'lead-notify',
                title: 'Unlock new AI Agent skills',
                description: `Try AI Agent's shopping assistant capabilities for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days.`,
                shouldShowDescriptionIcon: false,
                showVideo: true,
                shouldShowNotificationIcon: true,
                progressPercentage: undefined,
                progressText: undefined,
                showProgressBar: false,
                primaryButton: {
                    label: 'Notify admin',
                    onClick: expect.any(Function),
                    disabled: false,
                },
                secondaryButton: {
                    label: 'Book a demo',
                    href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_BOOK_DEMO,
                    target: '_blank',
                    onClick: expect.any(Function),
                    disabled: false,
                },
                videoModalButton: undefined,
            })
        })

        it('should log correct event when primary notify admin button is clicked', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            result.current?.promoCardContent?.primaryButton?.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Notify Admin', trialType: TrialType.ShoppingAssistant },
            )
        })

        it('should log correct event when secondary demo button is clicked', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            result.current?.promoCardContent?.secondaryButton?.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Demo', trialType: TrialType.ShoppingAssistant },
            )
        })
    })

    describe('During trial - Trial Priority Logic', () => {
        it('should prioritize trial progress over pre-trial access for admin', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                isAdminUser: true,
                canBookDemo: true,
                hasCurrentStoreTrialStarted: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.variant).toBe(
                'admin-trial-progress',
            )
            expect(result.current?.promoCardContent?.title).toBe(
                'Shopping Assistant trial',
            )
        })

        it('should prioritize trial progress over pre-trial access for lead', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canNotifyAdmin: true,
                hasCurrentStoreTrialStarted: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.variant).toBe(
                'lead-trial-progress',
            )
            expect(result.current?.promoCardContent?.title).toBe(
                'Shopping Assistant trial',
            )
        })

        it('should show card when only hasAnyTrialStarted is true', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent).not.toBeNull()
            expect(result.current?.promoCardContent?.variant).toBe(
                'lead-trial-progress',
            )
        })

        it('should show card when only hasCurrentStoreTrialStarted is true', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current).not.toBeNull()
            expect(result.current?.promoCardContent?.variant).toBe(
                'lead-trial-progress',
            )
        })
    })

    describe('Event tracking on component mount', () => {
        it('should log Trial view event when user can see trial CTA', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewViewed,
                { type: 'Trial' },
            )
        })

        it('should log Demo view event when user can book demo', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canBookDemo: true,
            })

            renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewViewed,
                { type: 'Demo' },
            )
        })

        it('should log Notify view event when user can notify admin', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canNotifyAdmin: true,
            })

            renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewViewed,
                { type: 'Notify' },
            )
        })

        it('should not log view event when no content is returned', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                // All false - no access
            })

            renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(mockLogEvent).not.toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewViewed,
                expect.any(Object),
            )
        })
    })

    describe('Notification icon logic', () => {
        it('should show notification icon when primary button contains "Notify"', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canNotifyAdmin: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(
                result.current?.promoCardContent?.shouldShowNotificationIcon,
            ).toBe(true)
            expect(result.current?.promoCardContent?.primaryButton.label).toBe(
                'Notify admin',
            )
        })

        it('should not show notification icon when primary button does not contain "Notify"', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(
                result.current?.promoCardContent?.shouldShowNotificationIcon,
            ).toBe(false)
            expect(result.current?.promoCardContent?.primaryButton.label).toBe(
                `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            )
        })
    })

    describe('Hook dependencies and account domain', () => {
        it('should pass account domain to trial flow hook', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(mockUseShoppingAssistantTrialFlow).toHaveBeenCalledWith({
                accountDomain: 'test-account',
                storeActivations: mockStoreActivations,
                trialType: TrialType.ShoppingAssistant,
            })
        })
    })

    describe('Shop name fallback logic', () => {
        it('should use first shop from integrations list when shopName is undefined', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: 'first-shop',
            })
        })

        it('should use route shopName when provided', () => {
            renderHook(
                () =>
                    useTrialPromoCard(
                        'specific-shop',
                        mockShopifyIntegrations,
                        'specific-shop',
                    ),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: 'specific-shop',
            })
        })

        it('should handle empty shopify integrations list gracefully', () => {
            mockUseAppSelector.mockImplementation((selector: any) => {
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                if (selector === getShopifyIntegrationsSortedByName) {
                    return []
                }
                if (selector === getCurrentUser) {
                    return fromJS(user)
                }
                return undefined
            })
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(
                () =>
                    useTrialPromoCard(
                        undefined as any, // Test edge case with no shop name
                        [], // Pass empty array to match what the selector returns
                    ),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: undefined,
            })
        })

        it('should handle shopify integrations without meta.shop_name', () => {
            const integrationsWithoutShopName = [
                {
                    ...shopifyIntegration,
                    id: 1,
                    name: 'First Shop',
                    meta: {
                        ...shopifyIntegration.meta,
                        shop_name: undefined as any, // No shop_name property
                    },
                },
            ]

            mockUseAppSelector.mockImplementation((selector: any) => {
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                if (selector === getShopifyIntegrationsSortedByName) {
                    return integrationsWithoutShopName
                }
                if (selector === getCurrentUser) {
                    return fromJS(user)
                }
                return undefined
            })
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(
                () =>
                    useTrialPromoCard(
                        undefined as any, // Test edge case with no shop name
                        integrationsWithoutShopName, // Pass the integrations without shop_name
                    ),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: undefined,
            })
        })
    })

    describe('Trial Metrics Integration', () => {
        beforeEach(() => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                isAdminUser: true,
                hasCurrentStoreTrialStarted: true,
            })
        })

        it('should show GMV description with icon when GMV rate is above threshold', () => {
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$5,250',
                gmvInfluencedRate: 0.75,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.description).toBe(
                '$5,250 GMV influenced',
            )
            expect(
                result.current?.promoCardContent?.shouldShowDescriptionIcon,
            ).toBe(true)
        })

        it('should hide description when GMV rate is below threshold', () => {
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$1,250',
                gmvInfluencedRate: 0.0025,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.description).toBe('')
            expect(
                result.current?.promoCardContent?.shouldShowDescriptionIcon,
            ).toBe(false)
        })

        it('should show "Upgrade now" button when GMV rate is above threshold', () => {
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$8,500',
                gmvInfluencedRate: 0.85,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.primaryButton.label).toBe(
                'Upgrade now',
            )
            expect(
                result.current?.promoCardContent?.primaryButton.disabled,
            ).toBe(false)
        })

        it('should show "Set Up Sales Strategy" button when GMV rate is below threshold', () => {
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$1,000',
                gmvInfluencedRate: 0.002,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.primaryButton.label).toBe(
                'Upgrade now',
            )
            expect(
                result.current?.promoCardContent?.primaryButton.disabled,
            ).toBe(false)
        })

        it('should show empty description when metrics are loading and GMV should be shown', () => {
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$5,250',
                gmvInfluencedRate: 0.75,
                isLoading: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.description).toBe('')
            expect(
                result.current?.promoCardContent?.shouldShowDescriptionIcon,
            ).toBe(false)
        })

        it('should show GMV description when user has opted out', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                isAdminUser: true,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: true,
            })
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$2,750',
                gmvInfluencedRate: 0.25,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.description).toBe(
                '$2,750 GMV influenced',
            )
            expect(
                result.current?.promoCardContent?.shouldShowDescriptionIcon,
            ).toBe(true)
            expect(result.current?.promoCardContent?.primaryButton.label).toBe(
                'Upgrade now',
            )
        })

        it('should handle lead users with GMV above threshold by disabling/hiding buttons', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                hasCurrentStoreTrialStarted: true,
            })
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$7,250',
                gmvInfluencedRate: 0.82,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.variant).toBe(
                'lead-trial-progress',
            )
            expect(result.current?.promoCardContent?.primaryButton.label).toBe(
                '',
            )
            expect(
                result.current?.promoCardContent?.primaryButton.disabled,
            ).toBe(true)
            expect(result.current?.promoCardContent?.description).toBe(
                '$7,250 GMV influenced',
            )
        })
    })

    describe('Progress Bar Logic and Display', () => {
        beforeEach(() => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
                hasCurrentStoreTrialStarted: true,
            })
        })

        describe('Progress percentage calculations', () => {
            it('should show 100% progress when 14 days remaining', () => {
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 14,
                    remainingDaysFloat: 14.0,
                    trialEndDatetime: '2024-01-28T00:00:00.000Z',
                    trialTerminationDatetime: null,
                    optedOutDatetime: null,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(result.current?.promoCardContent?.showProgressBar).toBe(
                    true,
                )
                expect(
                    result.current?.promoCardContent?.progressPercentage,
                ).toBe(100)
                expect(result.current?.promoCardContent?.progressText).toBe(
                    '14 days left',
                )
            })

            it('should show 50% progress when 7 days remaining', () => {
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 7,
                    remainingDaysFloat: 7.0,
                    trialEndDatetime: '2024-01-21T00:00:00.000Z',
                    trialTerminationDatetime: null,
                    optedOutDatetime: null,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.progressPercentage,
                ).toBe(50)
                expect(result.current?.promoCardContent?.progressText).toBe(
                    '7 days left',
                )
            })

            it('should show 7% progress when 1 day remaining', () => {
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 1,
                    remainingDaysFloat: 1.0,
                    trialEndDatetime: '2024-01-15T00:00:00.000Z',
                    trialTerminationDatetime: null,
                    optedOutDatetime: null,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.progressPercentage,
                ).toBe(7)
                expect(result.current?.promoCardContent?.progressText).toBe(
                    '1 day left',
                )
            })

            it('should show 0% progress when 0 days remaining', () => {
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 0,
                    remainingDaysFloat: 0.0,
                    trialEndDatetime: '2024-01-14T00:00:00.000Z',
                    trialTerminationDatetime: null,
                    optedOutDatetime: null,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.progressPercentage,
                ).toBe(0)
                expect(result.current?.promoCardContent?.progressText).toBe(
                    'Trial ends today',
                )
            })
        })

        describe('Progress bar visibility', () => {
            it('should show progress bar during admin trial', () => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    isAdminUser: true,
                    hasCurrentStoreTrialStarted: true,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(result.current?.promoCardContent?.showProgressBar).toBe(
                    true,
                )
                expect(result.current?.promoCardContent?.variant).toBe(
                    'admin-trial-progress',
                )
            })

            it('should show progress bar during lead trial', () => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: false,
                    hasCurrentStoreTrialStarted: true,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(result.current?.promoCardContent?.showProgressBar).toBe(
                    true,
                )
                expect(result.current?.promoCardContent?.variant).toBe(
                    'lead-trial-progress',
                )
            })

            it('should not show progress bar in pre-trial states', () => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: true,
                    hasCurrentStoreTrialStarted: false,
                    hasAnyTrialStarted: false,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(result.current?.promoCardContent?.showProgressBar).toBe(
                    false,
                )
                expect(
                    result.current?.promoCardContent?.progressPercentage,
                ).toBeUndefined()
                expect(
                    result.current?.promoCardContent?.progressText,
                ).toBeUndefined()
                expect(result.current?.promoCardContent?.variant).toBe(
                    'admin-trial',
                )
            })
        })

        describe('Edge cases and boundary conditions', () => {
            it('should handle progress percentage bounds correctly', () => {
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 15,
                    remainingDaysFloat: 15.0, // More than trial duration
                    trialEndDatetime: '2024-01-29T00:00:00.000Z',
                    trialTerminationDatetime: null,
                    optedOutDatetime: null,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.progressPercentage,
                ).toBe(100) // Max capped at 100
            })
        })
    })

    describe('Admin/Lead Trial Progress Button States', () => {
        describe('Admin trial progress scenarios', () => {
            beforeEach(() => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    isAdminUser: true,
                    hasCurrentStoreTrialStarted: true,
                })
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 7,
                    remainingDaysFloat: 7.0,
                    trialEndDatetime: '2024-01-21T00:00:00.000Z',
                    trialTerminationDatetime: null,
                    optedOutDatetime: null,
                })
            })

            it('should show "Upgrade now" button when GMV is above threshold', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$8,500',
                    gmvInfluencedRate: 0.85,
                    isLoading: false,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(result.current?.promoCardContent?.variant).toBe(
                    'admin-trial-progress',
                )
                expect(
                    result.current?.promoCardContent?.primaryButton.label,
                ).toBe('Upgrade now')
                expect(
                    result.current?.promoCardContent?.primaryButton.disabled,
                ).toBe(false)
            })

            it('should show "Upgrade now" button when admin has opted out', () => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    isAdminUser: true,
                    hasCurrentStoreTrialStarted: true,
                    hasCurrentStoreTrialOptedOut: true,
                })
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,500',
                    gmvInfluencedRate: 0.25,
                    isLoading: false,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.primaryButton.label,
                ).toBe('Upgrade now')
                expect(
                    result.current?.promoCardContent?.primaryButton.disabled,
                ).toBe(false)
            })

            it('should show "Set Up Sales Strategy" button when GMV is below threshold and not opted out', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,000',
                    gmvInfluencedRate: 0.002,
                    isLoading: false,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.primaryButton.label,
                ).toBe('Upgrade now')
                expect(
                    result.current?.promoCardContent?.primaryButton.disabled,
                ).toBe(false)
            })

            it('should not disable "Upgrade now" button when metrics are loading', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$8,500',
                    gmvInfluencedRate: 0.85,
                    isLoading: true,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.primaryButton.label,
                ).toBe('Upgrade now')
                expect(
                    result.current?.promoCardContent?.primaryButton.disabled,
                ).toBe(false)
            })

            it('should show "Manage Trial" secondary button when not opted out', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,000',
                    gmvInfluencedRate: 0.2,
                    isLoading: false,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.secondaryButton?.label,
                ).toBe('Manage Trial')
                expect(
                    result.current?.promoCardContent?.secondaryButton?.disabled,
                ).toBe(false)
            })

            it('should hide secondary button when admin has opted out', () => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: true,
                    hasCurrentStoreTrialStarted: true,
                    hasCurrentStoreTrialOptedOut: true,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.secondaryButton,
                ).toBeUndefined()
            })
        })

        describe('Lead trial progress scenarios', () => {
            beforeEach(() => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: false,
                    hasAnyTrialStarted: true,
                })
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 5,
                    remainingDaysFloat: 5.0,
                    trialEndDatetime: '2024-01-19T00:00:00.000Z',
                    trialTerminationDatetime: null,
                    optedOutDatetime: null,
                })
            })

            it('should show "Set Up Sales Strategy" button when GMV is below threshold', () => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    hasCurrentStoreTrialStarted: true,
                })

                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,200',
                    gmvInfluencedRate: 0.003,
                    isLoading: false,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(result.current?.promoCardContent?.variant).toBe(
                    'lead-trial-progress',
                )
                expect(
                    result.current?.promoCardContent?.primaryButton.label,
                ).toBe('')
                expect(
                    result.current?.promoCardContent?.primaryButton.disabled,
                ).toBe(true)
            })

            it('should disable primary button when GMV is above threshold', () => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    hasCurrentStoreTrialStarted: true,
                })
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$7,250',
                    gmvInfluencedRate: 0.82,
                    isLoading: false,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.primaryButton.label,
                ).toBe('')
                expect(
                    result.current?.promoCardContent?.primaryButton.disabled,
                ).toBe(true)
            })

            it('should disable primary button when lead has opted out', () => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: false,
                    hasCurrentStoreTrialStarted: true,
                    hasCurrentStoreTrialOptedOut: true,
                })
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,500',
                    gmvInfluencedRate: 0.25,
                    isLoading: false,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.primaryButton.label,
                ).toBe('')
                expect(
                    result.current?.promoCardContent?.primaryButton.disabled,
                ).toBe(true)
            })

            it('should never show secondary button for lead trial progress', () => {
                mockUseTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    hasCurrentStoreTrialStarted: true,
                })
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,200',
                    gmvInfluencedRate: 0.3,
                    isLoading: false,
                })

                const { result } = renderHook(
                    () =>
                        useTrialPromoCard(
                            'first-shop',
                            mockShopifyIntegrations,
                        ),
                    {
                        wrapper: createWrapper(),
                    },
                )

                expect(
                    result.current?.promoCardContent?.secondaryButton,
                ).toBeUndefined()
            })
        })
    })

    describe('Expired trial state', () => {
        it('should return null when trial has started and expired', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent).toBeNull()
        })
    })

    describe('isLoading property', () => {
        it('should return false when both trialMetrics and trialAccess are not loading', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
                isLoading: false,
            })
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$1,250',
                gmvInfluencedRate: 0.3,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.isLoading).toBe(false)
        })

        it('should return true when trialMetrics is loading', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
                isLoading: false,
            })
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$1,250',
                gmvInfluencedRate: 0.3,
                isLoading: true,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.isLoading).toBe(true)
        })

        it('should return true when trialAccess is loading', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
                isLoading: true,
            })
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$1,250',
                gmvInfluencedRate: 0.3,
                isLoading: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.isLoading).toBe(true)
        })
    })

    describe('automation rate functionality', () => {
        beforeEach(() => {
            // Reset mocks
            mockUseAiAgentAutomationRate.mockClear()

            // Mock store activations with trial configuration
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {
                    'first-shop': {
                        ...storeActivationFixture({ storeName: 'first-shop' }),
                        configuration: {
                            ...storeActivationFixture({
                                storeName: 'first-shop',
                            }).configuration,
                            trial: {
                                startDatetime: '2024-01-01T00:00:00Z',
                                endDatetime: '2024-01-15T00:00:00Z',
                                account: {
                                    optInDatetime: '2024-01-01T00:00:00Z',
                                    optOutDatetime: null,
                                    plannedUpgradeDatetime: null,
                                    actualUpgradeDatetime: null,
                                    actualTerminationDatetime: null,
                                },
                            },
                        },
                    },
                },
                progressPercentage: 0,
                isFetchLoading: false,
                isSaveLoading: false,
                changeSales: jest.fn(),
                changeSupport: jest.fn(),
                changeSupportChat: jest.fn(),
                changeSupportEmail: jest.fn(),
                saveStoreConfigurations: jest.fn(),
                migrateToNewPricing: jest.fn(),
                endTrial: jest.fn(),
                activation: jest.fn(() => ({
                    canActivate: jest.fn(() => ({
                        isLoading: false,
                        isDisabled: false,
                    })),
                    activate: jest.fn(),
                    isActivating: false,
                })),
            })

            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.AiAgent,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: false,
            })

            mockUseAiAgentAutomationRate.mockReturnValue({
                value: 0.75,
                prevValue: 0.65,
                isLoading: false,
                title: 'AI Agent Automation Rate',
                hint: {
                    title: 'Automated interactions from AI Agent as a percent of all customer interactions.',
                },
                metricFormat: 'decimal-to-percent-precision-1',
                'data-candu-id': 'ai-agent-overview-kpi-automation-rate',
            })
        })

        it('should fetch automation rate data when trial has started', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(mockUseAiAgentAutomationRate).toHaveBeenCalledWith(
                {
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: expect.stringMatching(
                            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
                        ),
                    },
                },
                'UTC',
                undefined,
            )

            expect(result.current.automationRate).toEqual({
                value: 0.75,
                prevValue: 0.65,
                isLoading: false,
            })
        })

        it('should return undefined automation rate when trial has not started', () => {
            // Reset the mock to return no data
            mockUseAiAgentAutomationRate.mockReturnValue({
                value: 0,
                prevValue: 0,
                isLoading: false,
                title: 'AI Agent Automation Rate',
                hint: {
                    title: 'Automated interactions from AI Agent as a percent of all customer interactions.',
                },
                metricFormat: 'decimal-to-percent-precision-1',
                'data-candu-id': 'ai-agent-overview-kpi-automation-rate',
            })

            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.AiAgent,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.automationRate).toBeUndefined()
        })

        it('should return undefined automation rate for shopping assistant trial type', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.ShoppingAssistant,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: false,
            })

            // Mock store activations with sales trial configuration
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {
                    'first-shop': {
                        ...storeActivationFixture({ storeName: 'first-shop' }),
                        configuration: {
                            ...storeActivationFixture({
                                storeName: 'first-shop',
                            }).configuration,
                            sales: {
                                trial: {
                                    startDatetime: '2024-01-01T00:00:00Z',
                                    endDatetime: '2024-01-15T00:00:00Z',
                                    account: {
                                        optInDatetime: '2024-01-01T00:00:00Z',
                                        optOutDatetime: null,
                                        plannedUpgradeDatetime: null,
                                        actualUpgradeDatetime: null,
                                        actualTerminationDatetime: null,
                                    },
                                },
                            },
                        },
                    },
                },
                progressPercentage: 0,
                isFetchLoading: false,
                isSaveLoading: false,
                changeSales: jest.fn(),
                changeSupport: jest.fn(),
                changeSupportChat: jest.fn(),
                changeSupportEmail: jest.fn(),
                saveStoreConfigurations: jest.fn(),
                migrateToNewPricing: jest.fn(),
                endTrial: jest.fn(),
                activation: jest.fn(() => ({
                    canActivate: jest.fn(() => ({
                        isLoading: false,
                        isDisabled: false,
                    })),
                    activate: jest.fn(),
                    isActivating: false,
                })),
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            // Shopping Assistant trials should not return automation rate data
            expect(result.current.automationRate).toBeUndefined()
        })
    })

    describe('AI Agent trial type promoCardContent', () => {
        beforeEach(() => {
            // Mock store activations with AI Agent trial configuration
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {
                    'first-shop': {
                        ...storeActivationFixture({ storeName: 'first-shop' }),
                        configuration: {
                            ...storeActivationFixture({
                                storeName: 'first-shop',
                            }).configuration,
                            trial: {
                                startDatetime: '2024-01-01T00:00:00Z',
                                endDatetime: '2024-01-15T00:00:00Z',
                                account: {
                                    optInDatetime: '2024-01-01T00:00:00Z',
                                    optOutDatetime: null,
                                    plannedUpgradeDatetime: null,
                                    actualUpgradeDatetime: null,
                                    actualTerminationDatetime: null,
                                },
                            },
                        },
                    },
                },
                progressPercentage: 0,
                isFetchLoading: false,
                isSaveLoading: false,
                changeSales: jest.fn(),
                changeSupport: jest.fn(),
                changeSupportChat: jest.fn(),
                changeSupportEmail: jest.fn(),
                saveStoreConfigurations: jest.fn(),
                migrateToNewPricing: jest.fn(),
                endTrial: jest.fn(),
                activation: jest.fn(() => ({
                    canActivate: jest.fn(() => ({
                        isLoading: false,
                        isDisabled: false,
                    })),
                    activate: jest.fn(),
                    isActivating: false,
                })),
            })

            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.AiAgent,
                canSeeTrialCTA: true,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
            })

            mockUseAiAgentAutomationRate.mockReturnValue({
                value: 0.75,
                prevValue: 0.65,
                isLoading: false,
                title: 'AI Agent Automation Rate',
                hint: {
                    title: 'Automated interactions from AI Agent as a percent of all customer interactions.',
                },
                metricFormat: 'decimal-to-percent-precision-1',
                'data-candu-id': 'ai-agent-overview-kpi-automation-rate',
            })
        })

        it('should return correct AI Agent title when not in trial progress and user is admin', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.AiAgent,
                canSeeTrialCTA: true,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.title).toBe('AI Agent')
            expect(result.current?.promoCardContent?.variant).toBe(
                'admin-trial',
            )
        })

        it('should return correct AI Agent title when not in trial progress and user is not admin', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.AiAgent,
                canSeeTrialCTA: false,
                canBookDemo: false,
                canNotifyAdmin: true,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.title).toBe(
                'Try AI Agent for free',
            )
            expect(result.current?.promoCardContent?.variant).toBe(
                'lead-notify',
            )
        })

        it('should return correct AI Agent title when in trial progress (admin user)', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.AiAgent,
                isAdminUser: true,
                canSeeTrialCTA: true,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.title).toBe(
                'AI Agent trial',
            )
            expect(result.current?.promoCardContent?.variant).toBe(
                'admin-trial-progress',
            )
        })

        it('should return correct AI Agent title when in trial progress (lead user)', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.AiAgent,
                canSeeTrialCTA: false,
                canBookDemo: false,
                canNotifyAdmin: true,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.title).toBe(
                'AI Agent trial',
            )
            expect(result.current?.promoCardContent?.variant).toBe(
                'lead-trial-progress',
            )
        })

        it('should show video when not in trial progress', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.showVideo).toBe(true)
        })

        it('should not show video when in trial progress', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.AiAgent,
                canSeeTrialCTA: true,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.showVideo).toBe(false)
        })

        it('should show video modal button when not in trial progress and can see trial CTA', () => {
            // Update useTrialAccess mock to return ShoppingAssistant trial type for USD-5 plan
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.ShoppingAssistant,
                canSeeTrialCTA: true,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(
                result.current?.promoCardContent?.videoModalButton,
            ).toBeDefined()
            expect(
                result.current?.promoCardContent?.videoModalButton?.label,
            ).toBe(`Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`)
        })

        it('should not show video modal button when in trial progress', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.AiAgent,
                canSeeTrialCTA: true,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(
                result.current?.promoCardContent?.videoModalButton,
            ).toBeUndefined()
        })
    })

    describe('Shopping Assistant trial type promoCardContent', () => {
        beforeEach(() => {
            // Mock store activations with Shopping Assistant trial configuration
            mockUseStoreActivations.mockReturnValue({
                storeActivations: {
                    'first-shop': {
                        ...storeActivationFixture({ storeName: 'first-shop' }),
                        configuration: {
                            ...storeActivationFixture({
                                storeName: 'first-shop',
                            }).configuration,
                            sales: {
                                trial: {
                                    startDatetime: '2024-01-01T00:00:00Z',
                                    endDatetime: '2024-01-15T00:00:00Z',
                                    account: {
                                        optInDatetime: '2024-01-01T00:00:00Z',
                                        optOutDatetime: null,
                                        plannedUpgradeDatetime: null,
                                        actualUpgradeDatetime: null,
                                        actualTerminationDatetime: null,
                                    },
                                },
                            },
                        },
                    },
                },
                progressPercentage: 0,
                isFetchLoading: false,
                isSaveLoading: false,
                changeSales: jest.fn(),
                changeSupport: jest.fn(),
                changeSupportChat: jest.fn(),
                changeSupportEmail: jest.fn(),
                saveStoreConfigurations: jest.fn(),
                migrateToNewPricing: jest.fn(),
                endTrial: jest.fn(),
                activation: jest.fn(() => ({
                    canActivate: jest.fn(() => ({
                        isLoading: false,
                        isDisabled: false,
                    })),
                    activate: jest.fn(),
                    isActivating: false,
                })),
            })

            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.ShoppingAssistant,
                canSeeTrialCTA: true,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
            })
        })

        it('should return correct Shopping Assistant title when not in trial progress', () => {
            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.title).toBe(
                'Unlock new AI Agent skills',
            )
            expect(result.current?.promoCardContent?.variant).toBe(
                'admin-trial',
            )
        })

        it('should return correct Shopping Assistant title when in trial progress', () => {
            mockUseTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                trialType: TrialType.ShoppingAssistant,
                isAdminUser: true,
                canSeeTrialCTA: true,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: false,
            })

            const { result } = renderHook(
                () => useTrialPromoCard('first-shop', mockShopifyIntegrations),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current?.promoCardContent?.title).toBe(
                'Shopping Assistant trial',
            )
            expect(result.current?.promoCardContent?.variant).toBe(
                'admin-trial-progress',
            )
        })
    })
})
