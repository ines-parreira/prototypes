import type * as React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'

import { useAiAgentTrialOnboarding } from '../useAiAgentTrialOnboarding'

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')

const mockUseAiAgentOnboardingNotification = assumeMock(
    useAiAgentOnboardingNotification,
)
const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)

const mockHandleOnSave = jest.fn()
const mockHandleOnSendOrCancelNotification = jest.fn()
const mockHandleOnPerformActionPostReceivedNotification = jest.fn()
const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

describe('useAiAgentTrialOnboarding', () => {
    const mockShopName = 'test-shop'
    const mockOnboardingWizardStepPath =
        '/ai-agent/shopify/test-shop/onboarding/tone of voice'

    let queryClient: QueryClient
    let wrapper: React.FC<{ children: React.ReactNode }>

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentNavigation.mockReturnValue({
            navigationItems: [],
            routes: {
                onboardingWizardStep: jest
                    .fn()
                    .mockReturnValue(mockOnboardingWizardStepPath),
            } as any,
        } as any)

        mockUseAiAgentOnboardingNotification.mockReturnValue({
            isAdmin: true,
            onboardingNotificationState: undefined,
            handleOnSave: mockHandleOnSave,
            handleOnSendOrCancelNotification:
                mockHandleOnSendOrCancelNotification,
            handleOnPerformActionPostReceivedNotification:
                mockHandleOnPerformActionPostReceivedNotification,
        } as any)

        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        const history = createMemoryHistory({ initialEntries: ['/'] })

        wrapper = ({ children }: { children: React.ReactNode }) => (
            <Router history={history}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Router>
        )
    })

    afterEach(() => {
        queryClient.clear()
    })

    describe('startOnboardingAfterTrial', () => {
        it('should handle onboarding flow for admin user', async () => {
            const { result } = renderHook(
                () => useAiAgentTrialOnboarding({ shopName: mockShopName }),
                { wrapper },
            )

            await act(async () => {
                await result.current.startOnboardingWizard()
            })

            expect(mockHandleOnSendOrCancelNotification).toHaveBeenCalledWith({
                aiAgentNotificationType:
                    AiAgentNotificationType.FinishAiAgentSetup,
            })
            expect(mockHandleOnSendOrCancelNotification).toHaveBeenCalledWith({
                aiAgentNotificationType:
                    AiAgentNotificationType.StartAiAgentSetup,
                isCancel: true,
            })

            expect(mockHandleOnSave).toHaveBeenCalledWith({
                onboardingState: AiAgentOnboardingState.StartedSetup,
            })

            expect(
                mockHandleOnPerformActionPostReceivedNotification,
            ).toHaveBeenCalledWith(AiAgentNotificationType.StartAiAgentSetup)

            expect(mockHistoryPush).toHaveBeenCalledWith({
                pathname: mockOnboardingWizardStepPath,
            })
        })

        it('should skip finish setup notification if already received', async () => {
            mockUseAiAgentOnboardingNotification.mockReturnValue({
                isAdmin: true,
                onboardingNotificationState: {
                    finishAiAgentSetupNotificationReceivedDatetime:
                        '2023-01-01T00:00:00.000Z',
                } as any,
                handleOnSave: mockHandleOnSave,
                handleOnSendOrCancelNotification:
                    mockHandleOnSendOrCancelNotification,
                handleOnPerformActionPostReceivedNotification:
                    mockHandleOnPerformActionPostReceivedNotification,
            } as any)

            const { result } = renderHook(
                () => useAiAgentTrialOnboarding({ shopName: mockShopName }),
                { wrapper },
            )

            await act(async () => {
                await result.current.startOnboardingWizard()
            })

            expect(
                mockHandleOnSendOrCancelNotification,
            ).not.toHaveBeenCalledWith({
                aiAgentNotificationType:
                    AiAgentNotificationType.FinishAiAgentSetup,
            })

            expect(mockHandleOnSendOrCancelNotification).toHaveBeenCalledWith({
                aiAgentNotificationType:
                    AiAgentNotificationType.StartAiAgentSetup,
                isCancel: true,
            })

            expect(mockHandleOnSave).toHaveBeenCalledWith({
                onboardingState: AiAgentOnboardingState.StartedSetup,
            })
            expect(mockHistoryPush).toHaveBeenCalledWith({
                pathname: mockOnboardingWizardStepPath,
            })
        })

        it('should skip notifications for non-admin user but still navigate', async () => {
            mockUseAiAgentOnboardingNotification.mockReturnValue({
                isAdmin: false,
                onboardingNotificationState: undefined,
                handleOnSave: mockHandleOnSave,
                handleOnSendOrCancelNotification:
                    mockHandleOnSendOrCancelNotification,
                handleOnPerformActionPostReceivedNotification:
                    mockHandleOnPerformActionPostReceivedNotification,
            } as any)

            const { result } = renderHook(
                () => useAiAgentTrialOnboarding({ shopName: mockShopName }),
                { wrapper },
            )

            await act(async () => {
                await result.current.startOnboardingWizard()
            })

            expect(mockHandleOnSendOrCancelNotification).not.toHaveBeenCalled()
            expect(mockHandleOnSave).not.toHaveBeenCalled()
            expect(
                mockHandleOnPerformActionPostReceivedNotification,
            ).not.toHaveBeenCalled()

            expect(mockHistoryPush).toHaveBeenCalledWith({
                pathname: mockOnboardingWizardStepPath,
            })
        })

        it('should navigate to correct wizard step', async () => {
            const mockOnboardingWizardStep = jest
                .fn()
                .mockReturnValue(mockOnboardingWizardStepPath)
            mockUseAiAgentNavigation.mockReturnValue({
                navigationItems: [],
                routes: {
                    onboardingWizardStep: mockOnboardingWizardStep,
                } as any,
            } as any)

            const { result } = renderHook(
                () => useAiAgentTrialOnboarding({ shopName: mockShopName }),
                { wrapper },
            )

            await act(async () => {
                await result.current.startOnboardingWizard()
            })

            expect(mockOnboardingWizardStep).toHaveBeenCalledWith(
                WizardStepEnum.TONE_OF_VOICE,
            )

            expect(mockHistoryPush).toHaveBeenCalledWith({
                pathname: mockOnboardingWizardStepPath,
            })
        })

        it('should handle async save operation correctly', async () => {
            const mockAsyncSave = jest.fn().mockResolvedValue({})
            mockUseAiAgentOnboardingNotification.mockReturnValue({
                isAdmin: true,
                onboardingNotificationState: undefined,
                handleOnSave: mockAsyncSave,
                handleOnSendOrCancelNotification:
                    mockHandleOnSendOrCancelNotification,
                handleOnPerformActionPostReceivedNotification:
                    mockHandleOnPerformActionPostReceivedNotification,
            } as any)

            const { result } = renderHook(
                () => useAiAgentTrialOnboarding({ shopName: mockShopName }),
                { wrapper },
            )

            await act(async () => {
                await result.current.startOnboardingWizard()
            })

            expect(mockAsyncSave).toHaveBeenCalledWith({
                onboardingState: AiAgentOnboardingState.StartedSetup,
            })

            expect(
                mockHandleOnPerformActionPostReceivedNotification,
            ).toHaveBeenCalledWith(AiAgentNotificationType.StartAiAgentSetup)
        })
    })

    describe('hook dependencies', () => {
        it('should call useAiAgentOnboardingNotification with correct shopName', () => {
            renderHook(
                () => useAiAgentTrialOnboarding({ shopName: mockShopName }),
                { wrapper },
            )

            expect(mockUseAiAgentOnboardingNotification).toHaveBeenCalledWith({
                shopName: mockShopName,
            })
        })

        it('should call useAiAgentNavigation with correct shopName', () => {
            renderHook(
                () => useAiAgentTrialOnboarding({ shopName: mockShopName }),
                { wrapper },
            )

            expect(mockUseAiAgentNavigation).toHaveBeenCalledWith({
                shopName: mockShopName,
            })
        })
    })
})
