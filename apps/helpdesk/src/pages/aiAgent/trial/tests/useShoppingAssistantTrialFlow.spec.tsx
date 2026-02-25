import type * as React from 'react'

import { useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { useModalManagerApi } from 'hooks/useModalManager'
import { useModalManager } from 'hooks/useModalManager'
import { useStartAiAgentTrialMutation } from 'models/aiAgent/queries'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import { getShopNameFromStoreActivations } from 'pages/aiAgent/utils/getShopNameFromStoreActivations'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useAiAgentTrialOnboarding } from '../hooks/useAiAgentTrialOnboarding'
import { useNotifyTrialExtensionSlackChannel } from '../hooks/useNotifyTrialExtensionSlackChannel'
import { useShoppingAssistantTrialFlow } from '../hooks/useShoppingAssistantTrialFlow'
import { useStartShoppingAssistantTrial } from '../hooks/useStartShoppingAssistantTrial'

// Mock the hooks
jest.mock('../hooks/useStartShoppingAssistantTrial')
jest.mock('../hooks/useNotifyTrialExtensionSlackChannel')
jest.mock('../hooks/useAiAgentTrialOnboarding')
jest.mock('models/aiAgent/queries')
jest.mock('hooks/useModalManager')
jest.mock('@repo/logging')
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('state/notifications/actions')
jest.mock('@repo/feature-flags')
jest.mock('pages/aiAgent/utils/extractShopNameFromUrl')
jest.mock('pages/aiAgent/utils/getShopNameFromStoreActivations')

const mockUseStartShoppingAssistantTrial = assumeMock(
    useStartShoppingAssistantTrial,
)
const mockUseStartAiAgentTrialMutation = assumeMock(
    useStartAiAgentTrialMutation,
)
const mockUseAiAgentTrialOnboarding = assumeMock(useAiAgentTrialOnboarding)
const mockUseModalManager = assumeMock(useModalManager)
const mockUseNotifyTrialExtensionSlackChannel = assumeMock(
    useNotifyTrialExtensionSlackChannel,
)
const mockLogEvent = assumeMock(logEvent)
const mockNotify = assumeMock(notify)
const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseFlag = assumeMock(useFlag)
const mockExtractShopNameFromUrl = assumeMock(extractShopNameFromUrl)
const mockGetShopNameFromStoreActivations = assumeMock(
    getShopNameFromStoreActivations,
)

const mockDispatch = jest.fn()
const mockNotifySlackChannel = jest.fn()
const mockHistoryPush = jest.fn()
const mockStartOnboardingAfterTrial = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            customerEngagement: '/ai-agent/customer-engagement',
            perShopOverview: '/ai-agent/overview',
        },
    }),
}))

describe('useShoppingAssistantTrialFlow', () => {
    const mockAccountDomain = 'test-domain'
    const mockStoreActivations = {
        store1: storeActivationFixture({ storeName: 'Test Store 1' }),
        store2: storeActivationFixture({ storeName: 'Test Store 2' }),
    }
    const mockOnUpgradeModalClose = jest.fn()
    const mockOnSuccessModalOpen = jest.fn()

    let queryClient: QueryClient
    let mockMutateAsync: jest.Mock
    let mockAiAgentMutateAsync: jest.Mock
    let wrapper: React.FC<{ children: React.ReactNode }>
    let mockModalManager: useModalManagerApi

    beforeEach(() => {
        jest.clearAllMocks()
        mockHistoryPush.mockClear()

        // Mock modal manager
        mockModalManager = {
            isOpen: jest.fn().mockReturnValue(false),
            openModal: jest.fn(),
            closeModal: jest.fn(),
            getParams: jest.fn().mockReturnValue(null),
            on: jest.fn(),
        }
        mockUseModalManager.mockReturnValue(mockModalManager)

        mockUseNotifyTrialExtensionSlackChannel.mockReturnValue(
            mockNotifySlackChannel,
        )

        mockUseAppDispatch.mockReturnValue(mockDispatch)

        mockUseFlag.mockReturnValue(false)

        mockUseAiAgentTrialOnboarding.mockReturnValue({
            startOnboardingWizard: mockStartOnboardingAfterTrial,
        })

        // Create a new QueryClient for each test
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        const history = createMemoryHistory({ initialEntries: ['/'] })

        // Create wrapper with QueryClientProvider
        wrapper = ({ children }: { children: React.ReactNode }) => (
            <Router history={history}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Router>
        )

        // Mock the mutations
        mockMutateAsync = jest.fn()
        mockUseStartShoppingAssistantTrial.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
            mutate: jest.fn(),
            reset: jest.fn(),
            isIdle: true,
            isPaused: false,
            isSuccess: false,
            isError: false,
            data: undefined,
            error: null,
            failureCount: 0,
            failureReason: null,
            status: 'idle',
            variables: undefined,
            context: undefined,
        })

        mockAiAgentMutateAsync = jest.fn()
        mockUseStartAiAgentTrialMutation.mockReturnValue({
            mutateAsync: mockAiAgentMutateAsync,
            isLoading: false,
            mutate: jest.fn(),
            reset: jest.fn(),
            isIdle: true,
            isPaused: false,
            isSuccess: false,
            isError: false,
            data: undefined,
            error: null,
            failureCount: 0,
            failureReason: null,
            status: 'idle',
            variables: undefined,
            context: undefined,
        })

        // Mock default shopName sources
        mockUseAppSelector.mockReturnValue([])
        mockExtractShopNameFromUrl.mockReturnValue(undefined)
        mockGetShopNameFromStoreActivations.mockReturnValue('Test Store 1')
    })

    afterEach(() => {
        queryClient.clear()
    })

    const renderHookWithDefaults = (
        overrides: Partial<
            Parameters<typeof useShoppingAssistantTrialFlow>[0]
        > = {},
    ) => {
        return renderHook(
            () =>
                useShoppingAssistantTrialFlow({
                    accountDomain: mockAccountDomain,
                    storeActivations: mockStoreActivations,
                    trialType: TrialType.ShoppingAssistant,
                    ...overrides,
                }),
            { wrapper },
        )
    }

    describe('initial state', () => {
        it('should have correct initial state', () => {
            const { result } = renderHookWithDefaults()

            expect(result.current.isLoading).toBe(false)
            expect(result.current.isTrialModalOpen).toBe(false)
            expect(result.current.isSuccessModalOpen).toBe(false)
        })
    })

    describe('modal state management', () => {
        it('should open upgrade modal and log event when openTrialUpgradeModal is called', () => {
            const { result } = renderHookWithDefaults()

            act(() => {
                result.current.openTrialUpgradeModal()
            })

            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.PricingModalViewed,
                {
                    type: 'Trial',
                    trialType: TrialType.ShoppingAssistant,
                },
            )
        })

        it('should close upgrade modal and call callback when closeUpgradeModal is called', () => {
            const { result } = renderHookWithDefaults({
                onUpgradeModalClose: mockOnUpgradeModalClose,
            })

            // First open the modal
            act(() => {
                result.current.openTrialUpgradeModal()
            })

            // Then close it
            act(() => {
                result.current.closeTrialUpgradeModal()
            })

            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )
            expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)
        })

        it('should dismiss upgrade modal and log event when onDismissTrialUpgradeModal is called', () => {
            const { result } = renderHookWithDefaults({
                onUpgradeModalClose: mockOnUpgradeModalClose,
            })

            act(() => {
                result.current.onDismissTrialUpgradeModal()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/pricing-modal-clicked',
                {
                    type: 'current_plan',
                    trialType: TrialType.ShoppingAssistant,
                },
            )
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )
            expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)
        })

        it('should dismiss upgrade modal and log event with AiAgent trial type', () => {
            const { result } = renderHookWithDefaults({
                onUpgradeModalClose: mockOnUpgradeModalClose,
                trialType: TrialType.AiAgent,
            })

            act(() => {
                result.current.onDismissTrialUpgradeModal()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/pricing-modal-clicked',
                {
                    type: 'current_plan',
                    trialType: TrialType.AiAgent,
                },
            )
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'AiAgentTrialUpgradeModal',
            )
            expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)
        })

        it('should close success modal when closeSuccessModal is called', () => {
            // Set up mock to return true for success modal initially
            mockModalManager.isOpen = jest.fn().mockReturnValue(true)

            const { result } = renderHookWithDefaults()

            // Verify success modal is open
            expect(result.current.isSuccessModalOpen).toBe(true)

            // Close the success modal
            act(() => {
                result.current.closeSuccessModal()
            })

            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantSuccessModal',
            )
        })

        it('should open trial finish setup modal when openTrialFinishSetupModal is called', () => {
            mockModalManager.isOpen = jest.fn().mockReturnValue(true)

            const { result } = renderHookWithDefaults()

            expect(result.current.isTrialFinishSetupModalOpen).toBe(true)

            // Open trial finish setup modal
            act(() => {
                result.current.openTrialFinishSetupModal()
            })

            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialFinishSetupModal',
            )
        })

        it('should close all trial modals when closeAllTrialModals is called', () => {
            const { result } = renderHookWithDefaults()

            act(() => {
                result.current.closeAllTrialModals()
            })

            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantUpgradeModal',
            )
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantSuccessModal',
            )
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantManageTrialModal',
            )
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialFinishSetupModal',
            )
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialRequestModal',
            )
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialOptOutModal',
            )
            expect(mockModalManager.closeModal).toHaveBeenCalledTimes(7)
        })

        it('should navigate to customer engagement when closeTrialFinishSetupModal is called with ShoppingAssistant trial type', () => {
            const { result } = renderHookWithDefaults()

            act(() => {
                result.current.closeTrialFinishSetupModal()
            })

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/ai-agent/customer-engagement',
            )
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialFinishSetupModal',
            )
        })

        it('should start onboarding when closeTrialFinishSetupModal is called with AiAgent trial type', () => {
            const { result } = renderHookWithDefaults({
                trialType: TrialType.AiAgent,
            })

            act(() => {
                result.current.closeTrialFinishSetupModal()
            })

            expect(mockStartOnboardingAfterTrial).toHaveBeenCalledTimes(1)
            expect(mockHistoryPush).not.toHaveBeenCalled()
        })

        describe('with feature flag enabled', () => {
            beforeEach(() => {
                mockUseFlag.mockReturnValue(true)
            })

            it('should start onboarding when closeTrialFinishSetupModal is called with ShoppingAssistant trial type and isOnboarded=false', () => {
                const { result } = renderHookWithDefaults({
                    trialType: TrialType.ShoppingAssistant,
                    isOnboarded: false,
                })

                act(() => {
                    result.current.closeTrialFinishSetupModal()
                })

                expect(mockStartOnboardingAfterTrial).toHaveBeenCalledTimes(1)
                expect(mockHistoryPush).not.toHaveBeenCalled()
            })

            it('should not start onboarding when closeTrialFinishSetupModal is called with ShoppingAssistant trial type and isOnboarded=true', () => {
                const { result } = renderHookWithDefaults({
                    isOnboarded: true,
                })

                act(() => {
                    result.current.closeTrialFinishSetupModal()
                })

                expect(mockStartOnboardingAfterTrial).not.toHaveBeenCalled()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/ai-agent/customer-engagement',
                )
            })
        })

        describe('with feature flag disabled', () => {
            beforeEach(() => {
                mockUseFlag.mockReturnValue(false)
            })

            it('should not start onboarding when closeTrialFinishSetupModal is called with ShoppingAssistant trial type and isOnboarded=false', () => {
                const { result } = renderHookWithDefaults({
                    isOnboarded: false,
                })

                act(() => {
                    result.current.closeTrialFinishSetupModal()
                })

                expect(mockStartOnboardingAfterTrial).not.toHaveBeenCalled()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/ai-agent/customer-engagement',
                )
            })
        })

        it('should open upgrade plan modal and log trial event when openUpgradePlanModal is called with isTrial=true', () => {
            const { result } = renderHookWithDefaults()

            act(() => {
                result.current.openUpgradePlanModal(true)
            })

            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantUpgradeModal',
            )
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.PricingModalViewed,
                {
                    type: 'Trial',
                    trialType: TrialType.ShoppingAssistant,
                },
            )
        })

        it('should open upgrade plan modal and log upgrade event when openUpgradePlanModal is called with isTrial=false', () => {
            const { result } = renderHookWithDefaults()

            act(() => {
                result.current.openUpgradePlanModal(false)
            })

            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantUpgradeModal',
            )
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.PricingModalViewed,
                {
                    type: 'Upgrade',
                    trialType: TrialType.ShoppingAssistant,
                },
            )
        })

        it('should open trial opt out modal when openTrialOptOutModal is called', () => {
            const { result } = renderHookWithDefaults()

            act(() => {
                result.current.openTrialOptOutModal()
            })

            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialOptOutModal',
            )
        })

        it('should open trial opt out modal with AiAgent trial type when openTrialOptOutModal is called', () => {
            const { result } = renderHookWithDefaults({
                trialType: TrialType.AiAgent,
            })

            act(() => {
                result.current.openTrialOptOutModal()
            })

            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'AiAgentTrialOptOutModal',
            )
        })

        it('should close trial opt out modal when closeTrialOptOutModal is called', () => {
            const { result } = renderHookWithDefaults()

            act(() => {
                result.current.closeTrialOptOutModal()
            })

            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialOptOutModal',
            )
        })

        it('should close trial opt out modal with AiAgent trial type when closeTrialOptOutModal is called', () => {
            const { result } = renderHookWithDefaults({
                trialType: TrialType.AiAgent,
            })

            act(() => {
                result.current.closeTrialOptOutModal()
            })

            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'AiAgentTrialOptOutModal',
            )
        })

        it('should check if trial opt out modal is open', () => {
            mockModalManager.isOpen = jest
                .fn()
                .mockImplementation(
                    (modalId) =>
                        modalId === 'ShoppingAssistantTrialOptOutModal',
                )

            const { result } = renderHookWithDefaults()

            expect(result.current.isTrialOptOutModalOpen).toBe(true)
        })

        it('should check if trial opt out modal is open with AiAgent trial type', () => {
            mockModalManager.isOpen = jest
                .fn()
                .mockImplementation(
                    (modalId) => modalId === 'AiAgentTrialOptOutModal',
                )

            const { result } = renderHookWithDefaults({
                trialType: TrialType.AiAgent,
            })

            expect(result.current.isTrialOptOutModalOpen).toBe(true)
        })
    })

    describe('startTrial functionality', () => {
        it('should call mutateAsync with correct parameters', () => {
            const { result } = renderHookWithDefaults()

            act(() => {
                result.current.startTrialDeprecated()
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                {
                    accountDomain: mockAccountDomain,
                    storeActivations: mockStoreActivations,
                },
                expect.any(Object),
            )
        })

        it('should handle successful trial start', async () => {
            const { result } = renderHookWithDefaults({
                onUpgradeModalClose: mockOnUpgradeModalClose,
                onSuccessModalOpen: mockOnSuccessModalOpen,
            })

            // Open upgrade modal first
            act(() => {
                result.current.openTrialUpgradeModal()
            })

            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )

            // Start trial
            act(() => {
                result.current.startTrialDeprecated()
            })

            // Simulate successful mutation
            const onSuccessCallback = mockMutateAsync.mock.calls[0][1].onSuccess
            await act(async () => {
                await onSuccessCallback()
            })

            // Check modal manager calls
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )
            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantSuccessModal',
            )

            // Check callbacks were called
            expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)
            expect(mockOnSuccessModalOpen).toHaveBeenCalledTimes(1)
        })

        it('should reflect loading state from mutation', () => {
            mockUseStartShoppingAssistantTrial.mockReturnValue({
                mutateAsync: mockMutateAsync,
                isLoading: true,
                mutate: jest.fn(),
                reset: jest.fn(),
                isIdle: false,
                isPaused: false,
                isSuccess: false,
                isError: false,
                data: undefined,
                error: null,
                failureCount: 0,
                failureReason: null,
                status: 'loading',
                variables: undefined,
                context: undefined,
            })

            const { result } = renderHookWithDefaults()

            expect(result.current.isLoading).toBe(true)
        })
    })

    describe('callback functions', () => {
        it('should not throw when callbacks are not provided', () => {
            const { result } = renderHookWithDefaults()

            // Should not throw
            expect(() => {
                act(() => {
                    result.current.closeTrialUpgradeModal()
                })
            }).not.toThrow()

            // Start trial and trigger success
            act(() => {
                result.current.startTrialDeprecated()
            })

            const onSuccessCallback = mockMutateAsync.mock.calls[0][1].onSuccess

            // Should not throw
            expect(() => {
                act(() => {
                    onSuccessCallback()
                })
            }).not.toThrow()
        })

        it('should handle multiple calls to callbacks gracefully', () => {
            const { result } = renderHookWithDefaults({
                onUpgradeModalClose: mockOnUpgradeModalClose,
            })

            // Call closeUpgradeModal multiple times
            act(() => {
                result.current.closeTrialUpgradeModal()
                result.current.closeTrialUpgradeModal()
                result.current.closeTrialUpgradeModal()
            })

            // Callback should be called once per closeUpgradeModal call
            expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(3)
        })
    })

    describe('onRequestTrialExtension', () => {
        it('should handle successful trial extension request', async () => {
            mockNotifySlackChannel.mockResolvedValue(true)

            const { result } = renderHookWithDefaults()

            const success = await act(async () => {
                return await result.current.onRequestTrialExtension(null)
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/trial-manage-banner-trial-extension-requested',
                {
                    CTA: 'Request Trial Extension',
                    trialType: TrialType.ShoppingAssistant,
                },
            )
            expect(mockNotifySlackChannel).toHaveBeenCalledTimes(1)
            expect(mockDispatch).toHaveBeenCalledWith(
                mockNotify({
                    status: NotificationStatus.Success,
                    message:
                        "We've received your trial extension request! Our team will review it and get back to you within 2 days via email.",
                }),
            )
            expect(success).toBe(true)
        })

        it('should handle failed trial extension request', async () => {
            mockNotifySlackChannel.mockResolvedValue(false)

            const { result } = renderHookWithDefaults()

            const success = await act(async () => {
                return await result.current.onRequestTrialExtension(null)
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent/trial-manage-banner-trial-extension-requested',
                {
                    CTA: 'Request Trial Extension',
                    trialType: TrialType.ShoppingAssistant,
                },
            )
            expect(mockNotifySlackChannel).toHaveBeenCalledTimes(1)
            expect(mockDispatch).toHaveBeenCalledWith(
                mockNotify({
                    status: NotificationStatus.Error,
                    message:
                        "We couldn't send your trial extension request. Please try again later or contact our billing team via chat or email.",
                }),
            )
            expect(success).toBe(false)
        })
    })

    describe('integration', () => {
        it('should handle complete flow from opening modal to successful trial', async () => {
            const { result } = renderHookWithDefaults({
                onUpgradeModalClose: mockOnUpgradeModalClose,
                onSuccessModalOpen: mockOnSuccessModalOpen,
            })

            // 1. Open upgrade modal
            act(() => {
                result.current.openTrialUpgradeModal()
            })
            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )

            // 2. Start trial
            act(() => {
                result.current.startTrialDeprecated()
            })

            // 3. Simulate successful mutation
            const onSuccessCallback = mockMutateAsync.mock.calls[0][1].onSuccess
            await act(async () => {
                await onSuccessCallback()
            })

            // 4. Verify final state
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantTrialUpgradeModal',
            )
            expect(mockModalManager.openModal).toHaveBeenCalledWith(
                'ShoppingAssistantSuccessModal',
            )
            expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)
            expect(mockOnSuccessModalOpen).toHaveBeenCalledTimes(1)

            // 5. Close success modal
            act(() => {
                result.current.closeSuccessModal()
            })
            expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                'ShoppingAssistantSuccessModal',
            )
        })
    })

    describe('AI Agent trial flow', () => {
        describe('initial state', () => {
            it('should have correct AI Agent trial initial state', () => {
                const { result } = renderHookWithDefaults({
                    trialType: TrialType.AiAgent,
                })

                expect(result.current.isTrialModalOpen).toBe(false)
                expect(result.current.isTrialRequestModalOpen).toBe(false)
            })
        })

        describe('modal management', () => {
            it('should open AI Agent trial upgrade modal when openTrialUpgradeModal is called with AiAgent trial type', () => {
                const { result } = renderHookWithDefaults({
                    trialType: TrialType.AiAgent,
                })

                act(() => {
                    result.current.openTrialUpgradeModal()
                })

                expect(mockModalManager.openModal).toHaveBeenCalledWith(
                    'AiAgentTrialUpgradeModal',
                )
            })

            it('should close AI Agent trial upgrade modal and call callback when closeTrialUpgradeModal is called with AiAgent trial type', () => {
                const { result } = renderHookWithDefaults({
                    onUpgradeModalClose: mockOnUpgradeModalClose,
                    trialType: TrialType.AiAgent,
                })

                act(() => {
                    result.current.closeTrialUpgradeModal()
                })

                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentTrialUpgradeModal',
                )
                expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)
            })

            it('should open AI Agent trial request modal when openTrialRequestModal is called with AiAgent trial type', () => {
                const { result } = renderHookWithDefaults({
                    trialType: TrialType.AiAgent,
                })

                act(() => {
                    result.current.openTrialRequestModal()
                })

                expect(mockModalManager.openModal).toHaveBeenCalledWith(
                    'AiAgentTrialRequestModal',
                )
            })

            it('should close AI Agent trial request modal when closeTrialRequestModal is called with AiAgent trial type', () => {
                const { result } = renderHookWithDefaults({
                    trialType: TrialType.AiAgent,
                })

                act(() => {
                    result.current.closeTrialRequestModal()
                })

                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentTrialRequestModal',
                )
            })
        })

        describe('startTrial functionality for AiAgent trial type', () => {
            const defaultProps = {
                accountDomain: mockAccountDomain,
                storeActivations: mockStoreActivations,
                trialType: TrialType.AiAgent,
            }

            const renderHookWithProps = (
                props: Partial<
                    Parameters<typeof useShoppingAssistantTrialFlow>[0]
                >,
            ) => {
                return renderHook(
                    () =>
                        useShoppingAssistantTrialFlow({
                            ...defaultProps,
                            ...props,
                        }),
                    { wrapper },
                )
            }

            it('should call AI Agent mutation with correct parameters when optedInForUpgrade is true', () => {
                const { result } = renderHookWithProps({})

                act(() => {
                    result.current.startTrial(true)
                })

                expect(mockAiAgentMutateAsync).toHaveBeenCalledWith(
                    ['shopify', 'Test Store 1', true],
                    expect.any(Object),
                )
                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent/pricing-modal-clicked',
                    {
                        type: 'ai_agent_trial_started',
                        trialType: 'aiAgent',
                    },
                )
            })

            it('should call AI Agent mutation with correct parameters when optedInForUpgrade is false', () => {
                const { result } = renderHookWithProps({})

                act(() => {
                    result.current.startTrial(false)
                })

                expect(mockAiAgentMutateAsync).toHaveBeenCalledWith(
                    ['shopify', 'Test Store 1', false],
                    expect.any(Object),
                )
            })

            it('should call AI Agent mutation with undefined when no parameter is provided', () => {
                const { result } = renderHookWithProps({})

                act(() => {
                    result.current.startTrial()
                })

                expect(mockAiAgentMutateAsync).toHaveBeenCalledWith(
                    ['shopify', 'Test Store 1', undefined],
                    expect.any(Object),
                )
            })

            it('should handle successful AI Agent trial start', async () => {
                const { result } = renderHookWithProps({
                    onUpgradeModalClose: mockOnUpgradeModalClose,
                    onSuccessModalOpen: mockOnSuccessModalOpen,
                })

                // Start AI Agent trial
                act(() => {
                    result.current.startTrial(true)
                })

                // Simulate successful mutation
                const onSuccessCallback =
                    mockAiAgentMutateAsync.mock.calls[0][1].onSuccess
                await act(async () => {
                    await onSuccessCallback()
                })

                // Check modal manager calls
                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentTrialUpgradeModal',
                )

                // Check callbacks were called
                expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)

                // Check trial finish modal is opened
                expect(mockModalManager.openModal).toHaveBeenCalledWith(
                    'AiAgentTrialFinishSetupModal',
                )
            })
        })

        describe('closeAllTrialModals', () => {
            it('should close all trial modals including AI Agent modals', () => {
                const { result } = renderHookWithDefaults({
                    trialType: TrialType.AiAgent,
                })

                act(() => {
                    result.current.closeAllTrialModals()
                })

                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentTrialUpgradeModal',
                )
                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentUpgradeModal',
                )
                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentSuccessModal',
                )
                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentManageTrialModal',
                )
                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentTrialFinishSetupModal',
                )
                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentTrialRequestModal',
                )
                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentTrialOptOutModal',
                )
                expect(mockModalManager.closeModal).toHaveBeenCalledTimes(7)
            })
        })

        describe('integration', () => {
            it('should handle complete AI Agent trial flow from opening modal to successful trial', async () => {
                const { result } = renderHookWithDefaults({
                    onUpgradeModalClose: mockOnUpgradeModalClose,
                    onSuccessModalOpen: mockOnSuccessModalOpen,
                    trialType: TrialType.AiAgent,
                })

                // 1. Open AI Agent upgrade modal
                act(() => {
                    result.current.openTrialUpgradeModal()
                })
                expect(mockModalManager.openModal).toHaveBeenCalledWith(
                    'AiAgentTrialUpgradeModal',
                )

                // 2. Start AI Agent trial
                act(() => {
                    result.current.startTrial(true)
                })

                // 3. Simulate successful mutation
                const onSuccessCallback =
                    mockAiAgentMutateAsync.mock.calls[0][1].onSuccess
                await act(async () => {
                    await onSuccessCallback()
                })

                // 4. Verify final state
                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'AiAgentTrialUpgradeModal',
                )
                expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)

                // 5. Verify trial finish modal is opened
                expect(mockModalManager.openModal).toHaveBeenCalledWith(
                    'AiAgentTrialFinishSetupModal',
                )
            })

            it('should handle complete Shopping Assistant trial flow using startTrial', async () => {
                const { result } = renderHookWithDefaults({
                    onUpgradeModalClose: mockOnUpgradeModalClose,
                })

                // 1. Start Shopping Assistant trial using startTrial
                act(() => {
                    result.current.startTrial()
                })

                // 2. Verify correct mutation is called with correct parameters
                expect(mockMutateAsync).toHaveBeenCalledWith(
                    {
                        accountDomain: mockAccountDomain,
                        storeActivations: mockStoreActivations,
                    },
                    expect.any(Object),
                )

                // 3. Verify correct event is logged
                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent/pricing-modal-clicked',
                    {
                        type: 'trial_started',
                        trialType: TrialType.ShoppingAssistant,
                    },
                )

                // 4. Simulate successful mutation
                const onSuccessCallback =
                    mockMutateAsync.mock.calls[0][1].onSuccess
                await act(async () => {
                    await onSuccessCallback()
                })

                // 5. Verify modal transitions - should close upgrade and open finish setup
                expect(mockModalManager.closeModal).toHaveBeenCalledWith(
                    'ShoppingAssistantTrialUpgradeModal',
                )
                expect(mockModalManager.openModal).toHaveBeenCalledWith(
                    'ShoppingAssistantTrialFinishSetupModal',
                )
                expect(mockOnUpgradeModalClose).toHaveBeenCalledTimes(1)

                // 6. Verify onboarding was NOT started for Shopping Assistant trial
                expect(mockStartOnboardingAfterTrial).not.toHaveBeenCalled()
            })
        })
    })

    describe('shopName fallback mechanism', () => {
        describe('shopName source priority', () => {
            it('should use shopName from storeActivations as primary source', () => {
                mockGetShopNameFromStoreActivations.mockReturnValue(
                    'store-from-activations',
                )
                mockExtractShopNameFromUrl.mockReturnValue('store-from-url')
                mockUseAppSelector.mockReturnValue([
                    { name: 'store-from-integrations' },
                ])

                const { result } = renderHookWithDefaults({
                    trialType: TrialType.AiAgent,
                })

                act(() => {
                    result.current.startTrial(true)
                })

                expect(mockAiAgentMutateAsync).toHaveBeenCalledWith(
                    ['shopify', 'store-from-activations', true],
                    expect.any(Object),
                )
            })

            it('should fallback to URL shopName when storeActivations is empty', () => {
                mockGetShopNameFromStoreActivations.mockReturnValue('')
                mockExtractShopNameFromUrl.mockReturnValue('store-from-url')
                mockUseAppSelector.mockReturnValue([
                    { name: 'store-from-integrations' },
                ])

                const { result } = renderHookWithDefaults({
                    trialType: TrialType.AiAgent,
                })

                act(() => {
                    result.current.startTrial(false)
                })

                expect(mockAiAgentMutateAsync).toHaveBeenCalledWith(
                    ['shopify', 'store-from-url', false],
                    expect.any(Object),
                )
            })

            it('should fallback to first store integration when storeActivations and URL are empty', () => {
                mockGetShopNameFromStoreActivations.mockReturnValue('')
                mockExtractShopNameFromUrl.mockReturnValue(undefined)
                mockUseAppSelector.mockReturnValue([
                    { name: 'store-from-integrations' },
                ])

                const { result } = renderHookWithDefaults({
                    trialType: TrialType.AiAgent,
                })

                act(() => {
                    result.current.startTrial()
                })

                expect(mockAiAgentMutateAsync).toHaveBeenCalledWith(
                    ['shopify', 'store-from-integrations', undefined],
                    expect.any(Object),
                )
            })

            it('should use empty string when all sources are unavailable', () => {
                mockGetShopNameFromStoreActivations.mockReturnValue('')
                mockExtractShopNameFromUrl.mockReturnValue(undefined)
                mockUseAppSelector.mockReturnValue([])

                const { result } = renderHookWithDefaults({
                    trialType: TrialType.AiAgent,
                })

                act(() => {
                    result.current.startTrial(true)
                })

                expect(mockAiAgentMutateAsync).toHaveBeenCalledWith(
                    ['shopify', '', true],
                    expect.any(Object),
                )
            })

            it('should handle empty storeIntegrations array when all other sources are empty', () => {
                mockGetShopNameFromStoreActivations.mockReturnValue('')
                mockExtractShopNameFromUrl.mockReturnValue(undefined)
                mockUseAppSelector.mockReturnValue([])

                const { result } = renderHookWithDefaults({
                    trialType: TrialType.AiAgent,
                })

                act(() => {
                    result.current.startTrial()
                })

                expect(mockAiAgentMutateAsync).toHaveBeenCalledWith(
                    ['shopify', '', undefined],
                    expect.any(Object),
                )
            })
        })

        describe('URL parameter handling', () => {
            it('should open trial modal when modal_name=opt-in and modal_version=ai-agent-trial are in URL', () => {
                const history = createMemoryHistory({
                    initialEntries: [
                        '/?modal_name=opt-in&modal_version=ai-agent-trial',
                    ],
                })

                const customWrapper = ({
                    children,
                }: {
                    children: React.ReactNode
                }) => (
                    <Router history={history}>
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    </Router>
                )

                renderHook(
                    () =>
                        useShoppingAssistantTrialFlow({
                            accountDomain: mockAccountDomain,
                            storeActivations: mockStoreActivations,
                            trialType: TrialType.AiAgent,
                        }),
                    { wrapper: customWrapper },
                )

                expect(mockModalManager.openModal).toHaveBeenCalledWith(
                    'AiAgentTrialUpgradeModal',
                )
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.PricingModalViewed,
                    {
                        type: 'Trial',
                        trialType: TrialType.AiAgent,
                        source: 'url_params',
                    },
                )
            })

            it('should not open trial modal when modal_name is incorrect', () => {
                const history = createMemoryHistory({
                    initialEntries: [
                        '/?modal_name=wrong&modal_version=ai-agent-trial',
                    ],
                })

                const customWrapper = ({
                    children,
                }: {
                    children: React.ReactNode
                }) => (
                    <Router history={history}>
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    </Router>
                )

                renderHook(
                    () =>
                        useShoppingAssistantTrialFlow({
                            accountDomain: mockAccountDomain,
                            storeActivations: mockStoreActivations,
                            trialType: TrialType.AiAgent,
                        }),
                    { wrapper: customWrapper },
                )

                expect(mockModalManager.openModal).not.toHaveBeenCalled()
            })

            it('should not open trial modal when modal_version is incorrect', () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?modal_name=opt-in&modal_version=wrong'],
                })

                const customWrapper = ({
                    children,
                }: {
                    children: React.ReactNode
                }) => (
                    <Router history={history}>
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    </Router>
                )

                renderHook(
                    () =>
                        useShoppingAssistantTrialFlow({
                            accountDomain: mockAccountDomain,
                            storeActivations: mockStoreActivations,
                            trialType: TrialType.AiAgent,
                        }),
                    { wrapper: customWrapper },
                )

                expect(mockModalManager.openModal).not.toHaveBeenCalled()
            })

            it('should not open trial modal when URL params are missing', () => {
                const history = createMemoryHistory({
                    initialEntries: ['/'],
                })

                const customWrapper = ({
                    children,
                }: {
                    children: React.ReactNode
                }) => (
                    <Router history={history}>
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    </Router>
                )

                renderHook(
                    () =>
                        useShoppingAssistantTrialFlow({
                            accountDomain: mockAccountDomain,
                            storeActivations: mockStoreActivations,
                            trialType: TrialType.AiAgent,
                        }),
                    { wrapper: customWrapper },
                )

                expect(mockModalManager.openModal).not.toHaveBeenCalled()
            })
        })
    })

    describe('source parameter', () => {
        it('should include source in PricingModalViewed event when openTrialUpgradeModal is called with source', () => {
            const { result } = renderHookWithDefaults({
                source: 'opportunities',
            })

            act(() => {
                result.current.openTrialUpgradeModal()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.PricingModalViewed,
                {
                    type: 'Trial',
                    trialType: TrialType.ShoppingAssistant,
                    source: 'opportunities',
                },
            )
        })

        it('should include source in PricingModalViewed event when openUpgradePlanModal is called with source', () => {
            const { result } = renderHookWithDefaults({
                source: 'opportunities',
            })

            act(() => {
                result.current.openUpgradePlanModal(true)
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.PricingModalViewed,
                {
                    type: 'Trial',
                    trialType: TrialType.ShoppingAssistant,
                    source: 'opportunities',
                },
            )
        })

        it('should include source in PricingModalViewed event when openTrialRequestModal is called with source', () => {
            const { result } = renderHookWithDefaults({
                source: 'opportunities',
            })

            act(() => {
                result.current.openTrialRequestModal()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.PricingModalViewed,
                {
                    type: 'Notify',
                    trialType: TrialType.ShoppingAssistant,
                    source: 'opportunities',
                },
            )
        })

        it('should include source in PricingModalClicked event when startTrial is called with source for ShoppingAssistant', () => {
            mockMutateAsync.mockResolvedValue({})
            const { result } = renderHookWithDefaults({
                source: 'opportunities',
            })

            act(() => {
                result.current.startTrial()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.PricingModalClicked,
                {
                    type: 'trial_started',
                    trialType: TrialType.ShoppingAssistant,
                    source: 'opportunities',
                },
            )
        })

        it('should include source in PricingModalClicked event when startTrial is called with source for AiAgent', () => {
            mockAiAgentMutateAsync.mockResolvedValue({})
            const { result } = renderHookWithDefaults({
                trialType: TrialType.AiAgent,
                source: 'opportunities',
            })

            act(() => {
                result.current.startTrial()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.PricingModalClicked,
                {
                    type: 'ai_agent_trial_started',
                    trialType: TrialType.AiAgent,
                    source: 'opportunities',
                },
            )
        })

        it('should not include source in events when source is not provided', () => {
            const { result } = renderHookWithDefaults()

            act(() => {
                result.current.openTrialUpgradeModal()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.PricingModalViewed,
                {
                    type: 'Trial',
                    trialType: TrialType.ShoppingAssistant,
                },
            )
        })
    })
})
