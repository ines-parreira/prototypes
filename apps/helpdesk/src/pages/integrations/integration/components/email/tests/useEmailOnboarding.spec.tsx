import { FeatureFlagKey } from '@repo/feature-flags'
import * as hooksImports from '@repo/hooks'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import createMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { EmailIntegration } from '@gorgias/helpdesk-client'
import {
    createIntegration,
    deleteIntegration,
    sendVerificationEmail,
    updateIntegration,
} from '@gorgias/helpdesk-client'
import type { HttpResponse, Integration } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import socketManager from 'services/socketManager'
import { fetchIntegration, onCreateSuccess } from 'state/integrations/actions'
import { DELETE_INTEGRATION_SUCCESS } from 'state/integrations/constants'
import { notify } from 'state/notifications/actions'
import type { RootState, StoreDispatch } from 'state/types'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import type {
    UseEmailOnboardingHookOptions,
    UseEmailOnboardingHookResult,
} from '../hooks/useEmailOnboarding'
import {
    EmailIntegrationOnboardingStep,
    stepUrl,
    useEmailOnboarding,
    useEmailOnboardingCompleteCheck,
} from '../hooks/useEmailOnboarding'

const mockStore = createMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()
const store = mockStore({})

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))
jest.mock('@gorgias/helpdesk-client')
jest.mock('state/integrations/actions')
jest.mock('state/notifications/actions')
jest.mock('services/socketManager')
jest.mock('hooks/useAppDispatch')

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        }) as Record<string, unknown>,
)

const mockHistoryPush = jest.fn()
const mockDispatch = jest.fn()
const createIntegrationMock = assumeMock(createIntegration)
const updateIntegrationMock = assumeMock(updateIntegration)
const deleteIntegrationMock = assumeMock(deleteIntegration)
const sendVerificationEmailMock = assumeMock(sendVerificationEmail)
const onSuccessMock = assumeMock(onCreateSuccess)
assumeMock(useAppDispatch).mockReturnValue(mockDispatch)

const render = (options?: UseEmailOnboardingHookOptions, path?: string) => {
    return renderHook(() => useEmailOnboarding(options), {
        wrapper: ({ children }) => (
            <MemoryRouter initialEntries={[path ?? '/']}>
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>
        ),
    })
}

const mockIsRequested = (isRequested: boolean) => {
    jest.spyOn(hooksImports, 'useLocalStorage').mockReturnValueOnce([
        isRequested ? new Date() : undefined,
        jest.fn(),
        jest.fn(),
    ])
}

describe('useEmailOnboarding()', () => {
    beforeEach(() => {
        mockFeatureFlags({
            [FeatureFlagKey.NewDomainVerification]: true,
        })
    })
    it('should have an initial state', () => {
        const { result } = render()
        const state: UseEmailOnboardingHookResult = result.current
        expect(state.integration).toEqual(undefined)
        expect(state.errors).toEqual(undefined)
        expect(state.isConnected).toEqual(false)
        expect(state.isConnecting).toEqual(false)
        expect(state.isVerified).toEqual(false)
        expect(state.isSending).toEqual(false)
        expect(state.isRequested).toEqual(false)
        expect(state.currentStep).toEqual(
            EmailIntegrationOnboardingStep.ConnectIntegration,
        )
        expect(typeof state.connectIntegration).toEqual('function')
        expect(typeof state.sendVerification).toEqual('function')
        expect(typeof state.deleteIntegration).toEqual('function')
        expect(typeof state.goBack).toEqual('function')
    })

    describe('current step', () => {
        it('should return ConnectIntegration when no integration is provided', () => {
            const { result } = render()
            expect(result.current.currentStep).toEqual(
                EmailIntegrationOnboardingStep.ConnectIntegration,
            )
        })

        it('should return SetupForwarding when the integration has not been verified', () => {
            mockIsRequested(false)
            const integration = {
                id: 1,
                meta: {
                    verified: false,
                },
            } as EmailIntegration
            const { result } = render({ integration })
            expect(result.current.currentStep).toEqual(
                EmailIntegrationOnboardingStep.SetupForwarding,
            )
        })

        it('should return SetupForwarding when the integration has been verified', () => {
            const integration = {
                meta: {
                    verified: true,
                },
            } as EmailIntegration
            const { result } = render({ integration })
            expect(result.current.currentStep).toEqual(
                EmailIntegrationOnboardingStep.SetupForwarding,
            )
        })

        describe('with URL overrides', () => {
            const integration = {
                id: 1,
                meta: {
                    verified: true,
                },
            } as EmailIntegration

            it('should return SetupForwarding when the the URL is set to forwarding', () => {
                const { result } = render(
                    { integration },
                    '/app/settings/channels/email/1/onboarding/setup-forwarding',
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.SetupForwarding,
                )
            })

            it('should return SetupForwarding when the the URL is set to forwarding and a verification has been sent', () => {
                const { result } = render(
                    { integration },
                    '/app/settings/channels/email/1/onboarding/setup-forwarding',
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.SetupForwarding,
                )
            })

            it('should return ConnectIntegration when the URL is set to connect', () => {
                const { result } = render(
                    { integration },
                    '/app/settings/channels/email/1/onboarding/connect-integration',
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.ConnectIntegration,
                )
            })

            it('should return DomainVerification when the URL is set to domain-verification and integration is verified', () => {
                mockIsRequested(true)
                const { result } = render(
                    { integration },
                    '/app/settings/channels/email/1/onboarding/domain-verification',
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.DomainVerification,
                )
            })

            it('should return SetupForwarding when the URL is set to domain-verification and integration is not verified', () => {
                mockIsRequested(false)
                const { result } = render(
                    {
                        integration: {
                            ...integration,
                            meta: {
                                verified: false,
                            },
                        } as EmailIntegration,
                    },
                    '/app/settings/channels/email/1/onboarding/domain-verification',
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.SetupForwarding,
                )
            })

            it('should return DomainVerification when the URL is set to domain-verification', () => {
                const { result } = render(
                    { integration },
                    '/app/settings/channels/email/1/onboarding/domain-verification',
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.DomainVerification,
                )
            })

            it('should return SetupForwarding when URL is set to domain-verification and forwarding is not verified and not requested', () => {
                mockIsRequested(false)
                const { result } = render(
                    {
                        integration: {
                            ...integration,
                            meta: {
                                verified: false,
                            },
                        } as EmailIntegration,
                    },
                    '/app/settings/channels/email/1/onboarding/domain-verification',
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.SetupForwarding,
                )
            })

            it('should return SetupForwarding when URL is set to domain-verification and forwarding is requested but not verified', () => {
                mockIsRequested(true)
                const { result } = render(
                    {
                        integration: {
                            ...integration,
                            meta: {
                                verified: false,
                            },
                        } as EmailIntegration,
                    },
                    '/app/settings/channels/email/1/onboarding/domain-verification',
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.SetupForwarding,
                )
            })
        })
    })

    describe('actions', () => {
        describe('connectIntegration()', () => {
            it('creates the integration if it does not exist', async () => {
                const { result } = render()

                const payload = {
                    name: 'Support Email',
                    meta: {
                        address: 'acme@gorigas.test',
                    },
                }

                const integration = {
                    id: 1,
                    type: 'email',
                    ...payload,
                }

                createIntegrationMock.mockResolvedValue({
                    data: integration,
                } as HttpResponse<Integration>)

                result.current.connectIntegration(payload)

                await waitFor(() => {
                    expect(createIntegrationMock).toHaveBeenCalledWith(
                        { ...payload, type: 'email' },
                        undefined,
                    )

                    expect(onSuccessMock).toHaveBeenCalledWith(
                        mockDispatch,
                        integration,
                        true,
                        true,
                    )

                    expect(mockHistoryPush).toHaveBeenCalledWith(
                        '/app/settings/channels/email/1/onboarding/forwarding-setup',
                    )
                })
            })

            it('updates the integration if it exists', async () => {
                const integration = {
                    id: 1,
                    name: 'Support Email Update',
                    meta: {
                        address: 'acme@gorigas.test',
                    },
                }

                const { result } = render({
                    integration: integration as EmailIntegration,
                })

                updateIntegrationMock.mockResolvedValue({
                    data: integration,
                } as HttpResponse<Integration>)

                result.current.connectIntegration(integration)

                await waitFor(() => {
                    expect(updateIntegrationMock).toHaveBeenCalledWith(
                        1,
                        integration,
                        undefined,
                    )

                    expect(onSuccessMock).toHaveBeenCalledWith(
                        mockDispatch,
                        integration,
                        true,
                        true,
                    )
                })
            })

            it('should set errors if the API call fails', async () => {
                const { result } = render()

                const payload = {
                    name: 'Support Email',
                    meta: {
                        address: 'acme@gorigas.test',
                    },
                }

                createIntegrationMock.mockRejectedValue({
                    isAxiosError: true,
                    response: {
                        data: {
                            error: {
                                msg: "Can't create integration",
                                data: {
                                    address: 'Is already used.',
                                },
                            },
                        },
                    },
                })

                result.current.connectIntegration(payload)

                await waitFor(() => {
                    expect(createIntegrationMock).toHaveBeenCalledWith(
                        { ...payload, type: 'email' },
                        undefined,
                    )

                    expect(result.current.errors).toEqual({
                        address: 'Is already used.',
                    })
                })
            })
        })

        describe('sendVerification()', () => {
            const integration = {
                id: 1,
                type: 'email',
            } as EmailIntegration

            beforeEach(() => {
                window.localStorage.clear()
            })

            it('sends a verification email', async () => {
                const { result } = render({ integration })

                sendVerificationEmailMock.mockResolvedValue({
                    data: undefined,
                } as HttpResponse<void>)

                expect(result.current.isRequested).toBe(false)

                result.current.sendVerification()

                await waitFor(() => {
                    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
                        1,
                        undefined,
                    )

                    expect(result.current.isRequested).toBe(true)

                    expect(mockHistoryPush).toHaveBeenCalledWith(
                        '/app/settings/channels/email/1/onboarding/verification',
                    )
                })
            })

            it('should display a banner if the sending fails', async () => {
                const { result } = render({ integration })

                sendVerificationEmailMock.mockRejectedValue({
                    isAxiosError: true,
                    response: {
                        data: {
                            error: {
                                msg: 'Please wait a bit',
                            },
                        },
                    },
                })

                expect(result.current.isRequested).toBe(false)

                result.current.sendVerification()

                await waitFor(() => {
                    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
                        1,
                        undefined,
                    )
                    expect(result.current.isRequested).toBe(false)
                    expect(notify).toHaveBeenCalledWith({
                        message: 'Please wait a bit',
                        status: 'error',
                    })
                })
            })

            it('should trigger an integration refetch if the integration has already been verified', async () => {
                const { result } = render({ integration })

                sendVerificationEmailMock.mockRejectedValue({
                    isAxiosError: true,
                    response: {
                        data: {
                            error: {
                                msg: 'This integration is already verified.',
                            },
                        },
                    },
                })

                expect(result.current.isRequested).toBe(false)

                result.current.sendVerification()

                await waitFor(() => {
                    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
                        1,
                        undefined,
                    )
                    expect(result.current.isRequested).toBe(false)
                    expect(fetchIntegration).toHaveBeenCalledWith(
                        String(integration.id),
                        'email',
                    )
                })
            })

            it('should display a generic error message if the sending fails without details', async () => {
                const { result } = render({ integration })

                sendVerificationEmailMock.mockRejectedValue({
                    isAxiosError: true,
                    response: undefined,
                })

                expect(result.current.isRequested).toBe(false)

                result.current.sendVerification()

                await waitFor(() => {
                    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
                        1,
                        undefined,
                    )
                    expect(result.current.isRequested).toBe(false)
                    expect(notify).toHaveBeenCalledWith({
                        message: 'Failed to send verification message',
                        status: 'error',
                    })
                })
            })

            it('is a no-op if no integration is connected', () => {
                const { result } = render()
                result.current.sendVerification()
                expect(sendVerificationEmailMock).not.toHaveBeenCalled()
            })

            it('should change requested and pending flags after sending a verification request', async () => {
                const { result } = render({ integration })

                sendVerificationEmailMock.mockResolvedValue({
                    data: undefined,
                } as HttpResponse<void>)

                expect(result.current.isRequested).toEqual(false)
                expect(result.current.isPending).toEqual(false)

                result.current.sendVerification()

                await waitFor(() => {
                    expect(result.current.isRequested).toEqual(true)
                    expect(result.current.isPending).toEqual(true)
                })
            })

            it('should change pending back to false after the timeout expires', async () => {
                jest.useFakeTimers()
                const now = new Date('2025-05-20T09:27:00.000Z')
                jest.setSystemTime(now)

                const integration = {
                    id: 1,
                    type: 'email',
                } as EmailIntegration

                sendVerificationEmailMock.mockResolvedValue({
                    data: undefined,
                } as HttpResponse<void>)

                const { result } = render({ integration })

                result.current.sendVerification()

                await waitFor(() => {
                    expect(result.current.isPending).toBe(true)
                    expect(result.current.isRequested).toBe(true)
                })

                // advance time to expire the pending window
                jest.setSystemTime(new Date(now.getTime() + 2 * 60_000 + 500))
                jest.advanceTimersByTime(2 * 60_000 + 500)

                await waitFor(() => {
                    expect(result.current.isPending).toBe(false)
                    expect(result.current.isRequested).toBe(true)
                })

                jest.useRealTimers()
            })

            it('should subscribe to integration events while pending', async () => {
                jest.useFakeTimers()
                const now = new Date('2025-05-20T09:27:00.000Z')
                jest.setSystemTime(now)

                const integration = {
                    id: 1,
                    type: 'email',
                } as EmailIntegration

                sendVerificationEmailMock.mockResolvedValue({
                    data: undefined,
                } as HttpResponse<void>)

                const { result } = render({ integration })

                result.current.sendVerification()

                await waitFor(() => {
                    expect(result.current.isPending).toBe(true)
                    expect(socketManager.join).toHaveBeenCalledWith(
                        'integration',
                        integration.id,
                    )
                })

                jest.setSystemTime(new Date(now.getTime() + 2 * 60_000 + 500))
                jest.advanceTimersByTime(2 * 60_000 + 500)

                await waitFor(() => {
                    expect(result.current.isPending).toBe(false)
                    expect(socketManager.leave).toHaveBeenCalledWith(
                        'integration',
                        integration.id,
                    )
                })

                jest.useRealTimers()
            })
        })

        describe('deleteIntegration()', () => {
            const integration = {
                id: 1,
                type: 'email',
            } as EmailIntegration

            it('deletes the integration', async () => {
                const { result } = render({ integration })

                deleteIntegrationMock.mockResolvedValue({
                    data: undefined,
                } as HttpResponse<void>)

                result.current.deleteIntegration()

                await waitFor(() => {
                    expect(deleteIntegrationMock).toHaveBeenCalledWith(
                        1,
                        undefined,
                    )
                    expect(mockDispatch).toHaveBeenCalledWith({
                        type: DELETE_INTEGRATION_SUCCESS,
                        id: 1,
                    })
                    expect(mockHistoryPush).toHaveBeenCalledWith(
                        '/app/settings/channels/email',
                    )
                })
            })

            it('should display a banner if the deleting fails', async () => {
                const { result } = render({ integration })

                deleteIntegrationMock.mockRejectedValue({
                    isAxiosError: true,
                    response: {
                        data: {
                            error: {
                                msg: 'Deletion failed',
                            },
                        },
                    },
                })

                result.current.deleteIntegration()

                await waitFor(() => {
                    expect(deleteIntegrationMock).toHaveBeenCalledWith(
                        1,
                        undefined,
                    )
                    expect(notify).toHaveBeenCalledWith({
                        message: 'Deletion failed',
                        status: 'error',
                    })
                })
            })

            it('should display a generic error message if the deleting fails without details', async () => {
                const { result } = render({ integration })

                deleteIntegrationMock.mockRejectedValue({
                    isAxiosError: true,
                    response: undefined,
                })

                result.current.deleteIntegration()

                await waitFor(() => {
                    expect(deleteIntegrationMock).toHaveBeenCalledWith(
                        1,
                        undefined,
                    )
                    expect(notify).toHaveBeenCalledWith({
                        message: 'Failed to delete integration',
                        status: 'error',
                    })
                })
            })

            it('is a no-op if no integration is connected', () => {
                const { result } = render()
                result.current.deleteIntegration()
                expect(deleteIntegrationMock).not.toHaveBeenCalled()
            })
        })

        describe('goBack()', () => {
            const integration = {
                id: 1,
                type: 'email',
            } as EmailIntegration

            it('should redirect to the integrations page if no integration is connected', () => {
                mockIsRequested(false)
                const { result } = render()
                result.current.goBack()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/settings/channels/email',
                )
            })

            it('should redirect to the integrations page if the current step is Connect Integration', () => {
                mockIsRequested(false)
                const { result } = render(
                    { integration },
                    '/app/settings/channels/email/1/onboarding/connect-integration',
                )
                result.current.goBack()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/settings/channels/email',
                )
            })

            it('should redirect to the Connect Integration if the current step is SetupForwarding', () => {
                mockIsRequested(false)
                const { result } = render(
                    { integration },
                    '/app/settings/channels/email/1/onboarding/setup-forwarding',
                )
                result.current.goBack()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/settings/channels/email/1/onboarding/connect-integration',
                )
            })

            it('should redirect to the SetupForwarding if the current step is DomainVerification', () => {
                const { result } = render(
                    {
                        integration: {
                            ...integration,
                            meta: {
                                verified: true,
                            },
                        } as EmailIntegration,
                    },
                    '/app/settings/channels/email/1/onboarding/domain-verification',
                )
                result.current.goBack()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/settings/channels/email/1/onboarding/setup-forwarding',
                )
            })
        })

        describe('goToNext()', () => {
            const integration = {
                id: 1,
                type: 'email',
            } as EmailIntegration

            it('should redirect to the integrations page if no integration is connected', () => {
                mockIsRequested(false)
                const { result } = render()
                result.current.goToNext()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/settings/channels/email',
                )
            })

            it('should redirect to SetupForwarding if the current step is Connect Integration', () => {
                mockIsRequested(false)
                const { result } = render(
                    { integration },
                    '/app/settings/channels/email/1/onboarding/connect-integration',
                )
                result.current.goToNext()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/settings/channels/email/1/onboarding/setup-forwarding',
                )
            })

            it('should redirect to the DomainVerification if the current step is SetupForwarding', () => {
                mockIsRequested(false)
                const { result } = render(
                    { integration },
                    '/app/settings/channels/email/1/onboarding/setup-forwarding',
                )
                result.current.goToNext()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/settings/channels/email/1/onboarding/domain-verification',
                )
            })

            it('should redirect to the integrations page if the current step is DomainVerification', () => {
                const { result } = render(
                    {
                        integration: {
                            ...integration,
                            meta: {
                                verified: true,
                            },
                        } as EmailIntegration,
                    },
                    '/app/settings/channels/email/1/onboarding/domain-verification',
                )
                result.current.goToNext()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/settings/channels/email',
                )
            })
        })
    })

    describe('URLs', () => {
        describe('stepUrl()', () => {
            it('should return the connect step URL if no integration provided', () => {
                expect(stepUrl()).toEqual(
                    '/app/settings/channels/email/new/onboarding/connect-integration',
                )

                expect(
                    stepUrl(EmailIntegrationOnboardingStep.ConnectIntegration),
                ).toEqual(
                    '/app/settings/channels/email/new/onboarding/connect-integration',
                )
            })

            it('should return the correct step URL', () => {
                const integration = {
                    id: 1,
                } as EmailIntegration

                expect(
                    stepUrl(
                        EmailIntegrationOnboardingStep.ConnectIntegration,
                        integration,
                    ),
                ).toEqual(
                    '/app/settings/channels/email/1/onboarding/connect-integration',
                )

                expect(
                    stepUrl(
                        EmailIntegrationOnboardingStep.SetupForwarding,
                        integration,
                    ),
                ).toEqual(
                    '/app/settings/channels/email/1/onboarding/setup-forwarding',
                )

                expect(
                    stepUrl(
                        EmailIntegrationOnboardingStep.DomainVerification,
                        integration,
                    ),
                ).toEqual(
                    '/app/settings/channels/email/1/onboarding/domain-verification',
                )
            })
        })
    })

    describe('useEmailOnboardingCompleteCheck()', () => {
        it('should complete the onboarding when calling completeOnboarding()', () => {
            const integration = {
                id: 1,
                type: 'email',
            } as EmailIntegration

            const setValue = jest.fn()
            const localStorageSpy = jest.spyOn(hooksImports, 'useLocalStorage')
            localStorageSpy.mockReturnValueOnce([false, setValue, jest.fn()])

            const { result } = renderHook(() =>
                useEmailOnboardingCompleteCheck(integration),
            )

            expect(localStorageSpy).toHaveBeenCalledWith(
                'email-onboarding-completed-1',
                false,
            )
            expect(result.current.isOnboardingComplete).toBe(false)

            result.current.completeOnboarding()

            expect(setValue).toHaveBeenCalledWith(true)
        })
    })
})
