import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from 'history'
import { fromJS, Map } from 'immutable'
import { Route, Router } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { storeActivationFixture } from 'pages/aiAgent/Activation/hooks/storeActivation.fixture'
import {
    KNOWLEDGE_ALERT_KIND,
    State,
} from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useActivateStore } from 'pages/aiAgent/Activation/hooks/useActivateStore'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useStoresConfigurationMutation } from 'pages/aiAgent/hooks/useStoresConfigurationMutation'
import { AlertType } from 'pages/common/components/Alert/Alert'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('pages/aiAgent/hooks/useStoresConfigurationMutation')
const useStoresConfigurationMutationMock = assumeMock(
    useStoresConfigurationMutation,
)

describe('useActivateStore', () => {
    const renderUseActivateStore = (args: {
        isLoading: boolean
        state: State
    }) => {
        const queryClient = mockQueryClient()
        const history = createMemoryHistory({ initialEntries: ['/'] })
        const wrapper = ({ children }: { children?: React.ReactNode }) => (
            <Router history={history}>
                <QueryClientProvider client={queryClient}>
                    <Route path="/">{children}</Route>
                </QueryClientProvider>
            </Router>
        )

        return renderHook(() => useActivateStore(args), { wrapper })
    }

    const upsertStoresConfigurationMock = jest.fn()
    beforeEach(() => {
        jest.clearAllMocks()

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAccountState) {
                return fromJS({ domain: 'test' }) as Map<string, string>
            }
        })

        useStoresConfigurationMutationMock.mockReturnValue({
            upsertStoresConfiguration: upsertStoresConfigurationMock,
            error: null,
            isLoading: false,
        })
    })
    describe('canActivate', () => {
        describe('loading cases', () => {
            it('should return loading=true and disabled=true when no shopName', () => {
                const { result } = renderUseActivateStore({
                    isLoading: false,
                    state: {
                        'my-shop': storeActivationFixture(),
                    },
                })
                const { canActivate } = result.current({ shopName: null })

                expect(canActivate()).toEqual({
                    isLoading: true,
                    isDisabled: true,
                })
            })

            it('should return loading=true and disabled=true when no isLoading', () => {
                const { result } = renderUseActivateStore({
                    isLoading: true,
                    state: {
                        'my-shop': storeActivationFixture(),
                    },
                })
                const { canActivate } = result.current({ shopName: 'my-shop' })

                expect(canActivate()).toEqual({
                    isLoading: true,
                    isDisabled: true,
                })
            })

            it('should return loading=true and disabled=true when no store not found', () => {
                const { result } = renderUseActivateStore({
                    isLoading: false,
                    state: {},
                })
                const { canActivate } = result.current({ shopName: 'my-shop' })

                expect(canActivate()).toEqual({
                    isLoading: true,
                    isDisabled: true,
                })
            })
        })

        it('should return disabled=true when no shop has alerts', () => {
            const { result } = renderUseActivateStore({
                isLoading: false,
                state: {
                    'my-shop': storeActivationFixture({
                        storeName: 'my-shop',
                        alerts: [
                            {
                                type: AlertType.Warning,
                                kind: KNOWLEDGE_ALERT_KIND,
                                message:
                                    'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
                                cta: { label: 'Visit Knowledge', to: '/' },
                            },
                        ],
                    }),
                },
            })
            const { canActivate } = result.current({ shopName: 'my-shop' })

            expect(canActivate()).toEqual({
                isLoading: false,
                isDisabled: true,
            })
        })

        it('should return disabled=false when shop missing chat integration', () => {
            const { result } = renderUseActivateStore({
                isLoading: false,
                state: {
                    'my-shop': storeActivationFixture({
                        storeName: 'my-shop',
                        settings: {
                            support: {
                                enabled: true,
                                chat: {
                                    enabled: false,
                                    isIntegrationMissing: true,
                                    isInstallationMissing: false,
                                },
                                email: {
                                    enabled: true,
                                    isIntegrationMissing: false,
                                },
                            },
                            sales: {
                                isDisabled: false,
                                enabled: true,
                            },
                        },
                    }),
                },
            })

            const { canActivate } = result.current({ shopName: 'my-shop' })

            expect(canActivate()).toEqual({
                isLoading: false,
                isDisabled: false,
            })
        })

        it('should return disabled=false when shop missing chat installation', () => {
            const { result } = renderUseActivateStore({
                isLoading: false,
                state: {
                    'my-shop': storeActivationFixture({
                        storeName: 'my-shop',
                        settings: {
                            support: {
                                enabled: true,
                                chat: {
                                    enabled: false,
                                    isIntegrationMissing: false,
                                    isInstallationMissing: true,
                                },
                                email: {
                                    enabled: true,
                                    isIntegrationMissing: false,
                                },
                            },
                            sales: {
                                isDisabled: false,
                                enabled: true,
                            },
                        },
                    }),
                },
            })

            const { canActivate } = result.current({ shopName: 'my-shop' })

            expect(canActivate()).toEqual({
                isLoading: false,
                isDisabled: false,
            })
        })

        it('should return disabled=false when shop missing email integration', () => {
            const { result } = renderUseActivateStore({
                isLoading: false,
                state: {
                    'my-shop': storeActivationFixture({
                        storeName: 'my-shop',
                        settings: {
                            support: {
                                enabled: true,
                                chat: {
                                    enabled: false,
                                    isIntegrationMissing: false,
                                    isInstallationMissing: false,
                                },
                                email: {
                                    enabled: true,
                                    isIntegrationMissing: true,
                                },
                            },
                            sales: {
                                isDisabled: false,
                                enabled: true,
                            },
                        },
                    }),
                },
            })

            const { canActivate } = result.current({ shopName: 'my-shop' })

            expect(canActivate()).toEqual({
                isLoading: false,
                isDisabled: false,
            })
        })

        it('should return disabled=true when shop missing email integration + chat integration + chat installation', () => {
            const { result } = renderUseActivateStore({
                isLoading: false,
                state: {
                    'my-shop': storeActivationFixture({
                        storeName: 'my-shop',
                        settings: {
                            support: {
                                enabled: true,
                                chat: {
                                    enabled: false,
                                    isIntegrationMissing: true,
                                    isInstallationMissing: true,
                                },
                                email: {
                                    enabled: true,
                                    isIntegrationMissing: true,
                                },
                            },
                            sales: {
                                isDisabled: false,
                                enabled: true,
                            },
                        },
                    }),
                },
            })

            const { canActivate } = result.current({ shopName: 'my-shop' })

            expect(canActivate()).toEqual({
                isLoading: false,
                isDisabled: true,
            })
        })
    })

    describe('activate', () => {
        it('should not call upsertStoresConfiguration when canActivate is disabled', () => {
            const { result } = renderUseActivateStore({
                isLoading: false,
                state: {
                    'my-shop': storeActivationFixture({
                        storeName: 'my-shop',
                        alerts: [
                            {
                                type: AlertType.Warning,
                                kind: KNOWLEDGE_ALERT_KIND,
                                message:
                                    'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
                                cta: { label: 'Visit Knowledge', to: '/' },
                            },
                        ],
                    }),
                },
            })
            const { activate } = result.current({
                shopName: 'my-shop',
            })

            const successMock = jest.fn()
            activate(successMock)

            expect(upsertStoresConfigurationMock).not.toHaveBeenCalled()
            expect(successMock).not.toHaveBeenCalled()
        })

        it('should call upsertStoresConfiguration when chat and email can be activated', () => {
            const { result } = renderUseActivateStore({
                isLoading: false,
                state: {
                    'my-shop': storeActivationFixture({
                        storeName: 'my-shop',
                        settings: {
                            support: {
                                enabled: true,
                                chat: {
                                    enabled: false,
                                    isIntegrationMissing: false,
                                    isInstallationMissing: false,
                                },
                                email: {
                                    enabled: false,
                                    isIntegrationMissing: false,
                                },
                            },
                            sales: {
                                isDisabled: false,
                                enabled: true,
                            },
                        },
                        configuration: getStoreConfigurationFixture({
                            emailChannelDeactivatedDatetime:
                                new Date().toISOString(),
                            chatChannelDeactivatedDatetime:
                                new Date().toISOString(),
                        }),
                    }),
                },
            })
            const { activate } = result.current({
                shopName: 'my-shop',
            })

            const successMock = jest.fn()
            activate(successMock)

            expect(upsertStoresConfigurationMock).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        emailChannelDeactivatedDatetime: null,
                        chatChannelDeactivatedDatetime: null,
                    }),
                ]),
            )
        })

        it('should call upsertStoresConfiguration only for chat when email is missing integration', () => {
            const { result } = renderUseActivateStore({
                isLoading: false,
                state: {
                    'my-shop': storeActivationFixture({
                        storeName: 'my-shop',
                        settings: {
                            support: {
                                enabled: true,
                                chat: {
                                    enabled: false,
                                    isIntegrationMissing: false,
                                    isInstallationMissing: false,
                                },
                                email: {
                                    enabled: false,
                                    isIntegrationMissing: true,
                                },
                            },
                            sales: {
                                isDisabled: false,
                                enabled: true,
                            },
                        },
                        configuration: getStoreConfigurationFixture({
                            emailChannelDeactivatedDatetime:
                                new Date().toISOString(),
                            chatChannelDeactivatedDatetime:
                                new Date().toISOString(),
                        }),
                    }),
                },
            })
            const { activate } = result.current({
                shopName: 'my-shop',
            })

            const successMock = jest.fn()
            activate(successMock)

            expect(upsertStoresConfigurationMock).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        chatChannelDeactivatedDatetime: null,
                    }),
                ]),
            )
        })

        it('should call upsertStoresConfiguration only for email when chat is missing integration', () => {
            const { result } = renderUseActivateStore({
                isLoading: false,
                state: {
                    'my-shop': storeActivationFixture({
                        storeName: 'my-shop',
                        settings: {
                            support: {
                                enabled: true,
                                chat: {
                                    enabled: false,
                                    isIntegrationMissing: true,
                                    isInstallationMissing: false,
                                },
                                email: {
                                    enabled: false,
                                    isIntegrationMissing: false,
                                },
                            },
                            sales: {
                                isDisabled: false,
                                enabled: true,
                            },
                        },
                        configuration: getStoreConfigurationFixture({
                            emailChannelDeactivatedDatetime:
                                new Date().toISOString(),
                            chatChannelDeactivatedDatetime:
                                new Date().toISOString(),
                        }),
                    }),
                },
            })
            const { activate } = result.current({
                shopName: 'my-shop',
            })

            const successMock = jest.fn()
            activate(successMock)

            expect(upsertStoresConfigurationMock).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        emailChannelDeactivatedDatetime: null,
                    }),
                ]),
            )
        })

        it('should call upsertStoresConfiguration only for email when chat is missing installation', () => {
            const { result } = renderUseActivateStore({
                isLoading: false,
                state: {
                    'my-shop': storeActivationFixture({
                        storeName: 'my-shop',
                        settings: {
                            support: {
                                enabled: true,
                                chat: {
                                    enabled: false,
                                    isIntegrationMissing: false,
                                    isInstallationMissing: true,
                                },
                                email: {
                                    enabled: false,
                                    isIntegrationMissing: false,
                                },
                            },
                            sales: {
                                isDisabled: false,
                                enabled: true,
                            },
                        },
                        configuration: getStoreConfigurationFixture({
                            emailChannelDeactivatedDatetime:
                                new Date().toISOString(),
                            chatChannelDeactivatedDatetime:
                                new Date().toISOString(),
                        }),
                    }),
                },
            })
            const { activate } = result.current({
                shopName: 'my-shop',
            })

            const successMock = jest.fn()
            activate(successMock)

            expect(upsertStoresConfigurationMock).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        emailChannelDeactivatedDatetime: null,
                    }),
                ]),
            )
        })
    })
})
