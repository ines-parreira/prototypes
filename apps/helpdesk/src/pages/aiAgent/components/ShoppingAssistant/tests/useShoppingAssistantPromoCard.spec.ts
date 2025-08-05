import { assumeMock } from '@repo/testing'
import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useParams } from 'react-router-dom'

import { logEvent, SegmentEvent } from '../../../../../common/segment'
import { useFlag } from '../../../../../core/flags'
import useAppSelector from '../../../../../hooks/useAppSelector'
import { getCurrentAccountState } from '../../../../../state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from '../../../../../state/integrations/selectors'
import { storeActivationFixture } from '../../../Activation/hooks/storeActivation.fixture'
import { useStoreActivations } from '../../../Activation/hooks/useStoreActivations'
import { useShoppingAssistantTrialAccess } from '../../../trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from '../../../trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from '../../../trial/hooks/useTrialEnding'
import { useTrialMetrics } from '../../../trial/hooks/useTrialMetrics'
import { EXTERNAL_URLS } from '../../../trial/hooks/useTrialModalProps'
import { useShoppingAssistantPromoCard } from '../hooks/useShoppingAssistantPromoCard'

// Mock dependencies
jest.mock('common/segment')
jest.mock('core/flags')
jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow')
jest.mock('pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess')
jest.mock('pages/aiAgent/trial/hooks/useTrialEnding')
jest.mock('pages/aiAgent/trial/hooks/useTrialMetrics')
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

const mockLogEvent = assumeMock(logEvent)
const mockUseFlag = assumeMock(useFlag)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseShoppingAssistantTrialFlow = assumeMock(
    useShoppingAssistantTrialFlow,
)
const mockUseShoppingAssistantTrialAccess = assumeMock(
    useShoppingAssistantTrialAccess,
)
const mockUseTrialEnding = assumeMock(useTrialEnding)
const mockUseTrialMetrics = assumeMock(useTrialMetrics)
const mockUseParams = assumeMock(useParams)

describe('useShoppingAssistantPromoCard', () => {
    const mockAccount = fromJS({
        id: 123,
        domain: 'test-account',
    })
    const mockStoreActivations = {
        'test-store': storeActivationFixture({ storeName: 'test-store' }),
    }
    const mockTrialFlow = {
        startTrial: jest.fn(),
        isLoading: false,
        isTrialModalOpen: false,
        isSuccessModalOpen: false,
        isManageTrialModalOpen: false,
        isUpgradePlanModalOpen: false,
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
    }
    const baseTrialAccess = {
        canSeeTrialCTA: false,
        canBookDemo: false,
        canNotifyAdmin: false,
        canSeeSystemBanner: false,
        hasAnyTrialActive: false,
        hasAnyTrialExpired: false,
        hasAnyTrialOptedIn: false,
        hasAnyTrialOptedOut: false,
        hasAnyTrialStarted: false,
        hasCurrentStoreTrialExpired: false,
        hasCurrentStoreTrialOptedOut: false,
        hasCurrentStoreTrialStarted: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(true)
        mockUseParams.mockReturnValue({ shopName: 'test-shop' })
        mockUseAppSelector.mockImplementation((selector: any) => {
            if (selector === getCurrentAccountState) {
                return mockAccount
            }
            if (selector === getShopifyIntegrationsSortedByName) {
                return [
                    {
                        id: 1,
                        name: 'First Shop',
                        meta: { shop_name: 'first-shop' },
                    },
                    {
                        id: 2,
                        name: 'Second Shop',
                        meta: { shop_name: 'second-shop' },
                    },
                ]
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
        mockUseShoppingAssistantTrialFlow.mockReturnValue(mockTrialFlow)
        mockUseShoppingAssistantTrialAccess.mockReturnValue(baseTrialAccess)
        mockUseTrialEnding.mockReturnValue({
            remainingDays: 7,
            remainingDaysFloat: 7.0,
            trialEndDatetime: '2024-01-15T00:00:00.000Z',
            trialTerminationDatetime: undefined,
            optedOutDatetime: undefined,
        })
        mockUseTrialMetrics.mockReturnValue({
            gmvInfluenced: '$1,250',
            gmvInfluencedRate: 0.3,
            isLoading: false,
        })
    })

    describe('Feature flag disabled', () => {
        it('should return null when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current).toBeNull()
        })
    })

    describe('No access permissions', () => {
        it('should return null when user has no access permissions', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: false,
                hasAnyTrialStarted: false,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current).toBeNull()
        })
    })

    describe('User Story: Admin with Starter/Basic Plan - Trial Access', () => {
        beforeEach(() => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
                canBookDemo: false,
                canNotifyAdmin: false,
            })
        })

        it('should return admin-trial variant with correct content - Try for 14 days', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current).toEqual({
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
                    label: 'Try for 14 days',
                    onClick: expect.any(Function),
                    disabled: false,
                },
                secondaryButton: {
                    label: 'Learn more',
                    href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
                    onClick: expect.any(Function),
                    disabled: false,
                },
                videoModalButton: {
                    label: 'Try for 14 days',
                    onClick: expect.any(Function),
                    disabled: false,
                },
            })
        })

        it('should trigger trial flow when primary button is clicked', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            result.current?.primaryButton.onClick?.()

            expect(mockTrialFlow.onConfirmTrial).toHaveBeenCalledTimes(1)
        })

        it('should trigger trial flow when video modal CTA is clicked', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            result.current?.videoModalButton?.onClick?.()

            expect(mockTrialFlow.onConfirmTrial).toHaveBeenCalledTimes(1)
        })

        it('should log correct event when primary button is clicked', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            result.current?.primaryButton.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Start Trial' },
            )
        })

        it('should log correct event when video modal CTA  is clicked', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            result.current?.videoModalButton?.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Start Trial' },
            )
        })

        it('should log correct event when secondary button is clicked', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            result.current?.secondaryButton?.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Learn' },
            )
        })
    })

    describe('User Story: Admin with Pro+ Plan - Demo Access', () => {
        beforeEach(() => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: true,
                canNotifyAdmin: false,
            })
        })

        it('should return admin-demo variant with correct content - Book a Demo', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current).toEqual({
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
                    onClick: expect.any(Function),
                    disabled: false,
                },
                secondaryButton: {
                    label: 'Learn more',
                    href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
                    onClick: expect.any(Function),
                    disabled: false,
                },
                videoModalButton: undefined,
            })
        })

        it('should log correct event when demo button is clicked', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            result.current?.primaryButton.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Demo' },
            )
        })
    })

    describe('User Story: Team Lead with Starter/Basic Plan - Notify Admin', () => {
        beforeEach(() => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: false,
                canNotifyAdmin: true,
            })
        })

        it('should return lead-notify variant with correct content and notification icon', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current).toEqual({
                variant: 'lead-notify',
                title: 'Unlock new AI Agent skills',
                description: 'Go beyond automation and grow revenue by 1.5%.',
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
                    onClick: expect.any(Function),
                    disabled: false,
                },
                videoModalButton: undefined,
            })
        })

        it('should log correct event when notify admin button is clicked', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            result.current?.primaryButton.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Notify Admin' },
            )
        })
    })

    describe('User Story: Team Lead with Pro+ Plan - Notify admin / book a demo', () => {
        beforeEach(() => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: true,
                canNotifyAdmin: true,
            })
        })

        it('should return lead-notify variant with notify admin as primary and demo as secondary', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current).toEqual({
                variant: 'lead-notify',
                title: 'Unlock new AI Agent skills',
                description: 'Go beyond automation and grow revenue by 1.5%.',
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
                    onClick: expect.any(Function),
                    disabled: false,
                },
                videoModalButton: undefined,
            })
        })

        it('should log correct event when primary notify admin button is clicked', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            result.current?.primaryButton?.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Notify Admin' },
            )
        })

        it('should log correct event when secondary demo button is clicked', () => {
            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            result.current?.secondaryButton?.onClick?.()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewCTAClicked,
                { CTA: 'Demo' },
            )
        })
    })

    describe('During trial - Trial Priority Logic', () => {
        it('should prioritize trial progress over pre-trial access for admin', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
                canBookDemo: true,
                hasCurrentStoreTrialStarted: true,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.variant).toBe('admin-trial-progress')
            expect(result.current?.title).toBe('Shopping Assistant trial')
        })

        it('should prioritize trial progress over pre-trial access for lead', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canNotifyAdmin: true,
                hasAnyTrialStarted: true,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.variant).toBe('lead-trial-progress')
            expect(result.current?.title).toBe('Shopping Assistant trial')
        })

        it('should show card when only hasAnyTrialStarted is true', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasAnyTrialStarted: true,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current).not.toBeNull()
            expect(result.current?.variant).toBe('lead-trial-progress')
        })

        it('should show card when only hasCurrentStoreTrialStarted is true', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                canBookDemo: false,
                canNotifyAdmin: false,
                hasCurrentStoreTrialStarted: true,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current).not.toBeNull()
            expect(result.current?.variant).toBe('lead-trial-progress')
        })
    })

    describe('Event tracking on component mount', () => {
        it('should log Trial view event when user can see trial CTA', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(() => useShoppingAssistantPromoCard())

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewViewed,
                { type: 'Trial' },
            )
        })

        it('should log Demo view event when user can book demo', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canBookDemo: true,
            })

            renderHook(() => useShoppingAssistantPromoCard())

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewViewed,
                { type: 'Demo' },
            )
        })

        it('should log Notify view event when user can notify admin', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canNotifyAdmin: true,
            })

            renderHook(() => useShoppingAssistantPromoCard())

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewViewed,
                { type: 'Notify' },
            )
        })

        it('should not log view event when no content is returned', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                // All false - no access
            })

            renderHook(() => useShoppingAssistantPromoCard())

            expect(mockLogEvent).not.toHaveBeenCalledWith(
                SegmentEvent.TrialBannerOverviewViewed,
                expect.any(Object),
            )
        })
    })

    describe('Notification icon logic', () => {
        it('should show notification icon when primary button contains "Notify"', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canNotifyAdmin: true,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.shouldShowNotificationIcon).toBe(true)
            expect(result.current?.primaryButton.label).toBe('Notify admin')
        })

        it('should not show notification icon when primary button does not contain "Notify"', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.shouldShowNotificationIcon).toBe(false)
            expect(result.current?.primaryButton.label).toBe('Try for 14 days')
        })
    })

    describe('Hook dependencies and account domain', () => {
        it('should pass account domain to trial flow hook', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(() => useShoppingAssistantPromoCard())

            expect(mockUseShoppingAssistantTrialFlow).toHaveBeenCalledWith({
                accountDomain: 'test-account',
                storeActivations: mockStoreActivations,
                onUpgradeModalClose: expect.any(Function),
                onSuccessModalOpen: expect.any(Function),
            })
        })

        it('should pass store name from useParams to useStoreActivations', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(() => useShoppingAssistantPromoCard())

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: 'test-shop',
            })
        })
    })

    describe('Shop name fallback logic', () => {
        it('should use first shop from integrations list when shopName is undefined', () => {
            mockUseParams.mockReturnValue({ shopName: undefined })
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(() => useShoppingAssistantPromoCard())

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: 'first-shop',
            })
        })

        it('should use route shopName when provided', () => {
            mockUseParams.mockReturnValue({ shopName: 'specific-shop' })
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(() => useShoppingAssistantPromoCard())

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: 'specific-shop',
            })
        })

        it('should handle empty shopify integrations list gracefully', () => {
            mockUseParams.mockReturnValue({ shopName: undefined })
            mockUseAppSelector.mockImplementation((selector: any) => {
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                if (selector === getShopifyIntegrationsSortedByName) {
                    return []
                }
                return undefined
            })
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(() => useShoppingAssistantPromoCard())

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: undefined,
            })
        })

        it('should handle shopify integrations without meta.shop_name', () => {
            mockUseParams.mockReturnValue({ shopName: undefined })
            mockUseAppSelector.mockImplementation((selector: any) => {
                if (selector === getCurrentAccountState) {
                    return mockAccount
                }
                if (selector === getShopifyIntegrationsSortedByName) {
                    return [
                        {
                            id: 1,
                            name: 'First Shop',
                            meta: {},
                        },
                    ]
                }
                return undefined
            })
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
            })

            renderHook(() => useShoppingAssistantPromoCard())

            expect(mockUseStoreActivations).toHaveBeenCalledWith({
                storeName: undefined,
            })
        })
    })

    describe('Trial Metrics Integration', () => {
        beforeEach(() => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
                hasCurrentStoreTrialStarted: true,
            })
        })

        it('should show GMV description with icon when GMV rate is above threshold', () => {
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$5,250',
                gmvInfluencedRate: 0.75,
                isLoading: false,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.description).toBe('$5,250 GMV influenced')
            expect(result.current?.shouldShowDescriptionIcon).toBe(true)
        })

        it('should hide description when GMV rate is below threshold', () => {
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$1,250',
                gmvInfluencedRate: 0.025,
                isLoading: false,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.description).toBe('')
            expect(result.current?.shouldShowDescriptionIcon).toBe(false)
        })

        it('should show "Upgrade now" button when GMV rate is above threshold', () => {
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$8,500',
                gmvInfluencedRate: 0.85,
                isLoading: false,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.primaryButton.label).toBe('Upgrade now')
            expect(result.current?.primaryButton.disabled).toBe(false)
        })

        it('should show "Set Up Sales Strategy" button when GMV rate is below threshold', () => {
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$1,000',
                gmvInfluencedRate: 0.02,
                isLoading: false,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.primaryButton.label).toBe(
                'Set Up Sales Strategy',
            )
            expect(result.current?.primaryButton.disabled).toBe(false)
        })

        it('should show empty description when metrics are loading and GMV should be shown', () => {
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$5,250',
                gmvInfluencedRate: 0.75,
                isLoading: true,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.description).toBe('')
            expect(result.current?.shouldShowDescriptionIcon).toBe(true)
        })

        it('should show GMV description when user has opted out', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: true,
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialOptedOut: true,
            })
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$2,750',
                gmvInfluencedRate: 0.25,
                isLoading: false,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.description).toBe('$2,750 GMV influenced')
            expect(result.current?.shouldShowDescriptionIcon).toBe(true)
            expect(result.current?.primaryButton.label).toBe('Upgrade now')
        })

        it('should handle lead users with GMV above threshold by disabling/hiding buttons', () => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
                ...baseTrialAccess,
                canSeeTrialCTA: false,
                hasAnyTrialStarted: true,
            })
            mockUseTrialMetrics.mockReturnValue({
                gmvInfluenced: '$7,250',
                gmvInfluencedRate: 0.82,
                isLoading: false,
            })

            const { result } = renderHook(() => useShoppingAssistantPromoCard())

            expect(result.current?.variant).toBe('lead-trial-progress')
            expect(result.current?.primaryButton.label).toBe('')
            expect(result.current?.primaryButton.disabled).toBe(true)
            expect(result.current?.description).toBe('$7,250 GMV influenced')
        })
    })

    describe('Progress Bar Logic and Display', () => {
        beforeEach(() => {
            mockUseShoppingAssistantTrialAccess.mockReturnValue({
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
                    trialTerminationDatetime: undefined,
                    optedOutDatetime: undefined,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.showProgressBar).toBe(true)
                expect(result.current?.progressPercentage).toBe(100)
                expect(result.current?.progressText).toBe('14 days left')
            })

            it('should show 50% progress when 7 days remaining', () => {
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 7,
                    remainingDaysFloat: 7.0,
                    trialEndDatetime: '2024-01-21T00:00:00.000Z',
                    trialTerminationDatetime: undefined,
                    optedOutDatetime: undefined,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.progressPercentage).toBe(50)
                expect(result.current?.progressText).toBe('7 days left')
            })

            it('should show 7% progress when 1 day remaining', () => {
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 1,
                    remainingDaysFloat: 1.0,
                    trialEndDatetime: '2024-01-15T00:00:00.000Z',
                    trialTerminationDatetime: undefined,
                    optedOutDatetime: undefined,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.progressPercentage).toBe(7)
                expect(result.current?.progressText).toBe('1 day left')
            })

            it('should show 0% progress when 0 days remaining', () => {
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 0,
                    remainingDaysFloat: 0.0,
                    trialEndDatetime: '2024-01-14T00:00:00.000Z',
                    trialTerminationDatetime: undefined,
                    optedOutDatetime: undefined,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.progressPercentage).toBe(0)
                expect(result.current?.progressText).toBe('Trial ends today')
            })
        })

        describe('Progress bar visibility', () => {
            it('should show progress bar during admin trial', () => {
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: true,
                    hasCurrentStoreTrialStarted: true,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.showProgressBar).toBe(true)
                expect(result.current?.variant).toBe('admin-trial-progress')
            })

            it('should show progress bar during lead trial', () => {
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: false,
                    hasAnyTrialStarted: true,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.showProgressBar).toBe(true)
                expect(result.current?.variant).toBe('lead-trial-progress')
            })

            it('should not show progress bar in pre-trial states', () => {
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: true,
                    hasCurrentStoreTrialStarted: false,
                    hasAnyTrialStarted: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.showProgressBar).toBe(false)
                expect(result.current?.progressPercentage).toBeUndefined()
                expect(result.current?.progressText).toBeUndefined()
                expect(result.current?.variant).toBe('admin-trial')
            })
        })

        describe('Edge cases and boundary conditions', () => {
            it('should handle progress percentage bounds correctly', () => {
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 15,
                    remainingDaysFloat: 15.0, // More than trial duration
                    trialEndDatetime: '2024-01-29T00:00:00.000Z',
                    trialTerminationDatetime: undefined,
                    optedOutDatetime: undefined,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.progressPercentage).toBe(100) // Max capped at 100
            })
        })
    })

    describe('Admin/Lead Trial Progress Button States', () => {
        describe('Admin trial progress scenarios', () => {
            beforeEach(() => {
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: true,
                    hasCurrentStoreTrialStarted: true,
                })
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 7,
                    remainingDaysFloat: 7.0,
                    trialEndDatetime: '2024-01-21T00:00:00.000Z',
                    trialTerminationDatetime: undefined,
                    optedOutDatetime: undefined,
                })
            })

            it('should show "Upgrade now" button when GMV is above threshold', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$8,500',
                    gmvInfluencedRate: 0.85,
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.variant).toBe('admin-trial-progress')
                expect(result.current?.primaryButton.label).toBe('Upgrade now')
                expect(result.current?.primaryButton.disabled).toBe(false)
            })

            it('should show "Upgrade now" button when admin has opted out', () => {
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: true,
                    hasCurrentStoreTrialStarted: true,
                    hasCurrentStoreTrialOptedOut: true,
                })
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,500',
                    gmvInfluencedRate: 0.25,
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.primaryButton.label).toBe('Upgrade now')
                expect(result.current?.primaryButton.disabled).toBe(false)
            })

            it('should show "Set Up Sales Strategy" button when GMV is below threshold and not opted out', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,000',
                    gmvInfluencedRate: 0.02,
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.primaryButton.label).toBe(
                    'Set Up Sales Strategy',
                )
                expect(result.current?.primaryButton.disabled).toBe(false)
            })

            it('should disable "Upgrade now" button when metrics are loading', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$8,500',
                    gmvInfluencedRate: 0.85,
                    isLoading: true,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.primaryButton.label).toBe('Upgrade now')
                expect(result.current?.primaryButton.disabled).toBe(true)
            })

            it('should show "Manage Trial" secondary button when not opted out', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,000',
                    gmvInfluencedRate: 0.2,
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.secondaryButton?.label).toBe(
                    'Manage Trial',
                )
                expect(result.current?.secondaryButton?.disabled).toBe(false)
            })

            it('should hide secondary button when admin has opted out', () => {
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: true,
                    hasCurrentStoreTrialStarted: true,
                    hasCurrentStoreTrialOptedOut: true,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.secondaryButton).toBeUndefined()
            })
        })

        describe('Lead trial progress scenarios', () => {
            beforeEach(() => {
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: false,
                    hasAnyTrialStarted: true,
                })
                mockUseTrialEnding.mockReturnValue({
                    remainingDays: 5,
                    remainingDaysFloat: 5.0,
                    trialEndDatetime: '2024-01-19T00:00:00.000Z',
                    trialTerminationDatetime: undefined,
                    optedOutDatetime: undefined,
                })
            })

            it('should show "Set Up Sales Strategy" button when GMV is below threshold', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,200',
                    gmvInfluencedRate: 0.03,
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.variant).toBe('lead-trial-progress')
                expect(result.current?.primaryButton.label).toBe(
                    'Set Up Sales Strategy',
                )
                expect(result.current?.primaryButton.disabled).toBe(false)
            })

            it('should disable primary button when GMV is above threshold', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$7,250',
                    gmvInfluencedRate: 0.82,
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.primaryButton.label).toBe('')
                expect(result.current?.primaryButton.disabled).toBe(true)
            })

            it('should disable primary button when lead has opted out', () => {
                mockUseShoppingAssistantTrialAccess.mockReturnValue({
                    ...baseTrialAccess,
                    canSeeTrialCTA: false,
                    hasAnyTrialStarted: true,
                    hasAnyTrialOptedOut: true,
                })
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,500',
                    gmvInfluencedRate: 0.25,
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.primaryButton.label).toBe('')
                expect(result.current?.primaryButton.disabled).toBe(true)
            })

            it('should never show secondary button for lead trial progress', () => {
                mockUseTrialMetrics.mockReturnValue({
                    gmvInfluenced: '$1,200',
                    gmvInfluencedRate: 0.3,
                    isLoading: false,
                })

                const { result } = renderHook(() =>
                    useShoppingAssistantPromoCard(),
                )

                expect(result.current?.secondaryButton).toBeUndefined()
            })
        })
    })
})
