import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {renderHook} from '@testing-library/react-hooks'
import {waitFor} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import createMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {createIntegration, updateIntegration} from '@gorgias/api-client'
import {HttpResponse, Integration} from '@gorgias/api-queries'

import {onCreateSuccess} from 'state/integrations/actions'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'
import {EmailIntegration} from 'models/integration/types'

const mockStore = createMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()
const store = mockStore({})

import {
    EmailIntegrationOnboardingStep,
    UseEmailOnboardingHookOptions,
    UseEmailOnboardingHookResult,
    useEmailOnboarding,
} from '../hooks/useEmailOnboarding'

jest.mock('pages/history')
jest.mock('@gorgias/api-client')
jest.mock('state/integrations/actions')

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        } as Record<string, unknown>)
)

const mockHistoryPush = jest.fn()
const createIntegrationMock = assumeMock(createIntegration)
const updateIntegrationMock = assumeMock(updateIntegration)
const onSuccessMock = assumeMock(onCreateSuccess)

const render = (options?: UseEmailOnboardingHookOptions, path?: string) => {
    return renderHook(() => useEmailOnboarding(options), {
        wrapper: ({children}) => (
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

describe('useEmailOnboarding()', () => {
    it('should have an initial state', () => {
        const {result} = render()
        const state: UseEmailOnboardingHookResult = result.current
        expect(state.integration).toEqual(undefined)
        expect(state.errors).toEqual(undefined)
        expect(state.isConnected).toEqual(false)
        expect(state.isConnecting).toEqual(false)
        expect(state.isVerified).toEqual(false)
        expect(state.isVerifying).toEqual(false)
        expect(state.currentStep).toEqual(
            EmailIntegrationOnboardingStep.ConnectIntegration
        )
        expect(typeof state.connectIntegration).toEqual('function')
        expect(typeof state.sendVerification).toEqual('function')
        expect(typeof state.deleteIntegration).toEqual('function')
        expect(typeof state.back).toEqual('function')
        expect(typeof state.cancel).toEqual('function')
    })

    describe('current step', () => {
        it('should return ConnectIntegration when no integration is provided', () => {
            const {result} = render()
            expect(result.current.currentStep).toEqual(
                EmailIntegrationOnboardingStep.ConnectIntegration
            )
        })

        it('should return ForwardingSetup when the integration has not been verified', () => {
            const integration = {
                id: 1,
                meta: {
                    verified: false,
                },
            } as EmailIntegration
            const {result} = render({integration})
            expect(result.current.currentStep).toEqual(
                EmailIntegrationOnboardingStep.ForwardingSetup
            )
        })

        it('should return Verification when the integration has been verified', () => {
            const integration = {
                meta: {
                    verified: true,
                },
            } as EmailIntegration
            const {result} = render({integration})
            expect(result.current.currentStep).toEqual(
                EmailIntegrationOnboardingStep.Verification
            )
        })

        describe('with URL overrides', () => {
            const integration = {
                id: 1,
                meta: {
                    verified: true,
                    email_forwarding_activated: true,
                },
            } as EmailIntegration

            it('should return ForwardingSetup when the the URL is set to forwarding', () => {
                const {result} = render(
                    {integration},
                    '/app/settings/channels/email/1/onboarding/forwarding-setup'
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.ForwardingSetup
                )
            })

            it('should return ConnectIntegration when the URL is set to connect', () => {
                const {result} = render(
                    {integration},
                    '/app/settings/channels/email/1/onboarding/connect-integration'
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.ConnectIntegration
                )
            })

            it('should return Verification when the URL is set to verification', () => {
                const {result} = render(
                    {integration},
                    '/app/settings/channels/email/1/onboarding/verification'
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.Verification
                )
            })

            it('should return ForwardingSetup when the URL is set to verification, if forwarding has not been enabled yet', () => {
                const {result} = render(
                    {
                        integration: {
                            ...integration,
                            meta: {
                                verified: true,
                                email_forwarding_activated: false,
                            },
                        } as EmailIntegration,
                    },
                    '/app/settings/channels/email/1/onboarding/verification'
                )
                expect(result.current.currentStep).toEqual(
                    EmailIntegrationOnboardingStep.ForwardingSetup
                )
            })
        })
    })

    describe('actions', () => {
        describe('connectIntegration()', () => {
            it('creates the integration if it does not exist', async () => {
                const {result} = render()

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
                        {...payload, type: 'email'},
                        undefined
                    )

                    expect(onSuccessMock).toHaveBeenCalledWith(
                        store.dispatch,
                        integration,
                        true,
                        true
                    )

                    expect(mockHistoryPush).toHaveBeenCalledWith(
                        '/app/settings/channels/email/1/onboarding'
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

                const {result} = render({
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
                        undefined
                    )

                    expect(onSuccessMock).toHaveBeenCalledWith(
                        store.dispatch,
                        integration,
                        true,
                        true
                    )
                })
            })

            it('should set errors if the API call fails', async () => {
                const {result, waitForValueToChange} = render()

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

                await waitForValueToChange(() => result.current.errors)

                expect(createIntegrationMock).toHaveBeenCalledWith(
                    {...payload, type: 'email'},
                    undefined
                )

                expect(result.current.errors).toEqual({
                    address: 'Is already used.',
                })
            })
        })

        describe('cancel()', () => {
            it('should redirect to the integrations page', () => {
                const {result} = render()
                result.current.cancel()
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/settings/channels/email'
                )
            })
        })
    })
})
