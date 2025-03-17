import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-hooks/dom'
import { mockFlags } from 'jest-launchdarkly-mock'

import * as segment from 'common/segment'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { KNOWLEDGE_ALERT_KIND } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { mockChatChannels } from 'pages/aiAgent/fixtures/chatChannels.fixture'
import { useSelfServiceChatChannelsMultiStore } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
const useSelfServiceChatChannelsMultiStoreMock = assumeMock(
    useSelfServiceChatChannelsMultiStore,
)

jest.mock('models/helpCenter/queries')
const useGetHelpCenterListMock = assumeMock(useGetHelpCenterList)

const queryClient = mockQueryClient()
const pageName = 'ai-agent-overview'

const renderUseStoreActivations = ({
    storeConfigurations,
}: {
    storeConfigurations: StoreConfiguration[]
}) =>
    renderHook(
        () =>
            useStoreActivations({
                storeConfigurations,
                accountDomain: 'my-account-domain',
                pageName,
            }),
        {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        },
    )

const mockLogEvent = jest.spyOn(segment, 'logEvent').mockImplementation(jest.fn)

describe('useStoreActivations', () => {
    const STORE_NAME = 'My Store'

    beforeEach(() => {
        mockFlags({})
        jest.clearAllMocks()

        useGetHelpCenterListMock.mockReturnValue({
            status: 'success',
            data: axiosSuccessResponse({
                data: [],
            }),
        } as any)

        useSelfServiceChatChannelsMultiStoreMock.mockReturnValue({
            [STORE_NAME]: [
                {
                    ...mockChatChannels[0],
                    value: {
                        ...mockChatChannels[0].value,
                        id: 1,
                    },
                },
            ],
        })
    })

    describe('when store has no scope + has no deactivated datetime for chat and email', () => {
        it('should have a score of 0 / 3', () => {
            const store = {
                storeName: STORE_NAME,
                scopes: [],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const { result } = renderUseStoreActivations({
                storeConfigurations: [store],
            })

            expect(result.current.score).toEqual(0)
        })

        describe('when store has monitored chat and email integration', () => {
            const store = {
                storeName: STORE_NAME,
                scopes: [],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const expectedInitialState = {
                name: 'My Store',
                title: 'My Store',
                configuration: store,
                alerts: [],
                support: {
                    chat: {
                        enabled: false,
                        isIntegrationMissing: false,
                    },
                    email: {
                        enabled: false,
                        isIntegrationMissing: false,
                    },
                    enabled: false,
                },
                sales: {
                    enabled: false,
                    isDisabled: true,
                },
            }

            it('should compute initial state', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                expect(result.current.storeActivations).toEqual({
                    'My Store': expectedInitialState,
                })
            })

            it('should enable Support and all monitored channels (chat + email) and allowing Sales when enabling Support', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales
                        .isDisabled,
                ).toBe(false)
            })

            it('should enable Support when enabling Email', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportEmailChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(false)
            })

            it('should enable Support and allow Sales when enabling Chat', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChatChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(true)
            })

            it('should disabled Support when disabling Email and Chat', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChange('My Store', true)
                    result.current.onSupportEmailChange('My Store', false)
                    result.current.onSupportChatChange('My Store', false)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(false)
            })

            it('should NOT enable Sales when Chat is not enabled', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales
                        .isDisabled,
                ).toBe(true)

                act(() => {
                    result.current.onSalesChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales
                        .isDisabled,
                ).toBe(true)
            })

            it('should enable Sales when Chat is enabled', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChatChange('My Store', true)
                    result.current.onSalesChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].sales
                        .isDisabled,
                ).toBe(false)
            })

            it('should return current state when changing a store that does not exits', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChange('Does not exist', true)
                    result.current.onSupportChatChange('Does not exist', true)
                    result.current.onSupportEmailChange('Does not exist', true)
                    result.current.onSalesChange('Does not exist', true)
                })

                expect(result.current.storeActivations).toEqual({
                    'My Store': expectedInitialState,
                })
            })
        })

        describe('when store has monitored chat but chat is not available chat integration', () => {
            const store = {
                storeName: STORE_NAME,
                scopes: [],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            beforeEach(() => {
                useSelfServiceChatChannelsMultiStoreMock.mockClear()
                useSelfServiceChatChannelsMultiStoreMock.mockReturnValue({
                    [STORE_NAME]: [
                        {
                            ...mockChatChannels[0],
                            value: {
                                ...mockChatChannels[0].value,
                                id: 42,
                            },
                        },
                    ],
                })
            })

            const expectedInitialState = {
                name: 'My Store',
                title: 'My Store',
                configuration: store,
                alerts: [],
                support: {
                    chat: {
                        enabled: false,
                        isIntegrationMissing: true,
                    },
                    email: {
                        enabled: false,
                        isIntegrationMissing: false,
                    },
                    enabled: false,
                },
                sales: {
                    enabled: false,
                    isDisabled: true,
                },
            }

            it('should compute initial state', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                expect(result.current.storeActivations).toEqual({
                    'My Store': expectedInitialState,
                })
            })
        })

        describe('when store has monitored chat + no monitored email', () => {
            const store = {
                storeName: STORE_NAME,
                scopes: [],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [],
            } as any as StoreConfiguration

            const expectedInitialState = {
                name: 'My Store',
                title: 'My Store',
                alerts: [],
                configuration: store,
                support: {
                    chat: {
                        enabled: false,
                        isIntegrationMissing: false,
                    },
                    email: {
                        enabled: false,
                        isIntegrationMissing: true,
                    },
                    enabled: false,
                },
                sales: {
                    enabled: false,
                    isDisabled: true,
                },
            }

            it('should compute initial state', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                expect(result.current.storeActivations).toEqual({
                    'My Store': expectedInitialState,
                })
            })

            it('should enable Support and all monitored channels (chat) and allowing Sales when enabling Support', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales
                        .isDisabled,
                ).toBe(false)
            })

            it('should not enable Support + Email when selecting Email', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportEmailChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(false)
            })
        })

        describe('when store has no monitored chat + monitored email', () => {
            const store = {
                storeName: STORE_NAME,
                scopes: [],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const expectedInitialState = {
                name: 'My Store',
                title: 'My Store',
                alerts: [],
                configuration: store,
                support: {
                    chat: {
                        enabled: false,
                        isIntegrationMissing: true,
                    },
                    email: {
                        enabled: false,
                        isIntegrationMissing: false,
                    },
                    enabled: false,
                },
                sales: {
                    enabled: false,
                    isDisabled: true,
                },
            }

            it('should compute initial state', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                expect(result.current.storeActivations).toEqual({
                    'My Store': expectedInitialState,
                })
            })

            it('should enable Support and all monitored channels (email) and allowing Sales when enabling Support', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales
                        .isDisabled,
                ).toBe(true)
            })

            it('should not enable Support + Chat when selecting Chat', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChatChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(false)
            })
        })

        describe('when store has no monitored chat + no monitored email', () => {
            const store = {
                storeName: STORE_NAME,
                scopes: [],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [],
                monitoredEmailIntegrations: [],
            } as any as StoreConfiguration

            const expectedInitialState = {
                name: 'My Store',
                title: 'My Store',
                alerts: [],
                configuration: store,
                support: {
                    chat: {
                        enabled: false,
                        isIntegrationMissing: true,
                    },
                    email: {
                        enabled: false,
                        isIntegrationMissing: true,
                    },
                    enabled: false,
                },
                sales: {
                    enabled: false,
                    isDisabled: true,
                },
            }

            it('should compute initial state', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                expect(result.current.storeActivations).toEqual({
                    'My Store': expectedInitialState,
                })
            })

            it('should not enable Support when enabling Support', () => {
                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales
                        .isDisabled,
                ).toBe(true)
            })
        })
    })

    describe('when store has Support scope + no deactivated datetime for chat + deactivated datetime for email', () => {
        it('should have a score of 1 / 3', () => {
            const store = {
                storeName: STORE_NAME,
                scopes: [AiAgentScope.Support],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: new Date().toISOString(),
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const { result } = renderUseStoreActivations({
                storeConfigurations: [store],
            })

            expect(result.current.score).toEqual(33)
        })
    })

    describe('when store has Support scope + deactivated datetime for chat + deactivated datetime for email', () => {
        it('should have a score of 0 / 3', () => {
            const store = {
                storeName: STORE_NAME,
                scopes: [AiAgentScope.Support],
                chatChannelDeactivatedDatetime: new Date().toISOString(),
                emailChannelDeactivatedDatetime: new Date().toISOString(),
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const { result } = renderUseStoreActivations({
                storeConfigurations: [store],
            })

            expect(result.current.score).toEqual(0)
        })
    })

    describe('when store has Support scope + no deactivated datetime for chat + for email', () => {
        it('should have a score of 2 / 3', () => {
            const store = {
                storeName: STORE_NAME,
                scopes: [AiAgentScope.Support],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const { result } = renderUseStoreActivations({
                storeConfigurations: [store],
            })

            expect(result.current.score).toEqual(67)
        })
    })

    describe('when store has Support + Sales scope + no deactivated datetime for chat + for email', () => {
        it('should have a score of 3 / 3', () => {
            const store = {
                storeName: STORE_NAME,
                scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const { result } = renderUseStoreActivations({
                storeConfigurations: [store],
            })

            expect(result.current.score).toEqual(100)
        })
    })

    describe('when clicking on the support toogle button', () => {
        describe('when the support is disabled', () => {
            it('should log the event ai-agent-activate-modal-skill-disabled', () => {
                const store = {
                    storeName: STORE_NAME,
                    scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                    monitoredChatIntegrations: [1],
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'foo@example.com' },
                    ],
                } as any as StoreConfiguration

                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChange('My Store', false)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)
                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-activate-modal-skill-disabled',
                    {
                        storeName: STORE_NAME,
                        page: pageName,
                        skill: 'support',
                    },
                )
            })
        })

        describe('when the support is enabled', () => {
            it('should log the event ai-agent-activate-modal-skill-enabled', () => {
                const store = {
                    storeName: STORE_NAME,
                    scopes: [AiAgentScope.Support],
                    chatChannelDeactivatedDatetime: new Date().toISOString(),
                    emailChannelDeactivatedDatetime: new Date().toISOString(),
                    monitoredChatIntegrations: [1],
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'foo@example.com' },
                    ],
                } as any as StoreConfiguration

                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.enabled,
                ).toBe(true)

                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)
                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-activate-modal-skill-enabled',
                    {
                        storeName: STORE_NAME,
                        page: pageName,
                        skill: 'support',
                    },
                )
            })
        })
    })
    describe('when clicking on the sales toogle button', () => {
        describe('when the sales is disabled', () => {
            it('should log the event ai-agent-activate-modal-skill-disabled', () => {
                const store = {
                    storeName: STORE_NAME,
                    scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                    monitoredChatIntegrations: [1],
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'foo@example.com' },
                    ],
                } as any as StoreConfiguration

                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSalesChange('My Store', false)
                })

                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)
                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-activate-modal-skill-disabled',
                    {
                        storeName: STORE_NAME,
                        page: pageName,
                        skill: 'sales',
                    },
                )
            })
        })

        describe('when the sales is enabled', () => {
            it('should log the event ai-agent-activate-modal-skill-enabled', () => {
                const store = {
                    storeName: STORE_NAME,
                    scopes: [AiAgentScope.Support],
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                    monitoredChatIntegrations: [1],
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'foo@example.com' },
                    ],
                } as any as StoreConfiguration

                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSalesChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(true)

                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-activate-modal-skill-enabled',
                    {
                        storeName: STORE_NAME,
                        page: pageName,
                        skill: 'sales',
                    },
                )
            })
        })
    })

    describe('when clicking on the support chat checkbox', () => {
        describe('when the support chat is disabled', () => {
            it('should log the event ai-agent-activate-modal-skill-disabled', () => {
                const store = {
                    storeName: STORE_NAME,
                    scopes: [AiAgentScope.Support],
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                    monitoredChatIntegrations: [1],
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'foo@example.com' },
                    ],
                } as any as StoreConfiguration

                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChatChange('My Store', false)
                })

                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)

                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-activate-modal-skill-disabled',
                    {
                        storeName: STORE_NAME,
                        page: pageName,
                        skill: 'support',
                        channel: 'chat',
                    },
                )
            })
        })

        describe('when the support chat is enabled', () => {
            it('should log the event ai-agent-activate-modal-skill-enabled', () => {
                const store = {
                    storeName: STORE_NAME,
                    scopes: [AiAgentScope.Support],
                    chatChannelDeactivatedDatetime: new Date().toISOString(),
                    emailChannelDeactivatedDatetime: null,
                    monitoredChatIntegrations: [1],
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'foo@example.com' },
                    ],
                } as any as StoreConfiguration

                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportChatChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)

                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-activate-modal-skill-enabled',
                    {
                        storeName: STORE_NAME,
                        page: pageName,
                        skill: 'support',
                        channel: 'chat',
                    },
                )
            })
        })
    })

    describe('when clicking on the support email checkbox', () => {
        describe('when the support email is disabled', () => {
            it('should log the event ai-agent-activate-modal-skill-disabled', () => {
                const store = {
                    storeName: STORE_NAME,
                    scopes: [AiAgentScope.Support],
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: null,
                    monitoredChatIntegrations: [1],
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'foo@example.com' },
                    ],
                } as any as StoreConfiguration

                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportEmailChange('My Store', false)
                })

                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(false)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)

                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-activate-modal-skill-disabled',
                    {
                        storeName: STORE_NAME,
                        page: pageName,
                        skill: 'support',
                        channel: 'email',
                    },
                )
            })
        })

        describe('when the support email is enabled', () => {
            it('should log the event ai-agent-activate-modal-skill-enabled', () => {
                const store = {
                    storeName: STORE_NAME,
                    scopes: [AiAgentScope.Support],
                    chatChannelDeactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: new Date().toISOString(),
                    monitoredChatIntegrations: [1],
                    monitoredEmailIntegrations: [
                        { id: 2, email: 'foo@example.com' },
                    ],
                } as any as StoreConfiguration

                const { result } = renderUseStoreActivations({
                    storeConfigurations: [store],
                })

                act(() => {
                    result.current.onSupportEmailChange('My Store', true)
                })

                expect(
                    result.current.storeActivations['My Store'].support.email
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].support.chat
                        .enabled,
                ).toBe(true)
                expect(
                    result.current.storeActivations['My Store'].sales.enabled,
                ).toBe(false)

                expect(mockLogEvent).toHaveBeenCalledWith(
                    'ai-agent-activate-modal-skill-enabled',
                    {
                        storeName: STORE_NAME,
                        page: pageName,
                        skill: 'support',
                        channel: 'email',
                    },
                )
            })
        })
    })

    describe('when store has a no helpcenter and there are knowledge FAQ', () => {
        beforeEach(() => {
            useGetHelpCenterListMock.mockClear()
        })

        it('should not set an alert for this store when useGetHelpCenterList is loading', () => {
            useGetHelpCenterListMock.mockReturnValue({
                status: 'loading',
                data: undefined,
            } as any)

            const store = {
                storeName: STORE_NAME,
                helpCenterId: null,
                scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const { result } = renderUseStoreActivations({
                storeConfigurations: [store],
            })

            expect(result.current.storeActivations['My Store'].alerts).toEqual(
                [],
            )
        })

        it('should set an alert for this store when useGetHelpCenterList is success', () => {
            useGetHelpCenterListMock.mockReturnValue({
                status: 'success',
                data: axiosSuccessResponse({
                    data: [
                        {
                            id: 1,
                            name: 'help center 1',
                            type: 'faq',
                        },
                    ],
                }),
            } as any)

            const store = {
                storeName: STORE_NAME,
                helpCenterId: null,
                scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const { result } = renderUseStoreActivations({
                storeConfigurations: [store],
            })

            expect(result.current.storeActivations['My Store'].alerts).toEqual([
                {
                    kind: KNOWLEDGE_ALERT_KIND,
                    cta: {
                        label: 'Visit Knowledge',
                        to: '/app/automation/shopify/My Store/ai-agent/knowledge',
                    },
                    message:
                        'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
                    type: 'warning',
                },
            ])
        })

        it('should set an only once alert for this store even if useGetHelpCenterList is re-triggered', () => {
            useGetHelpCenterListMock.mockReturnValueOnce({
                status: 'success',
                data: axiosSuccessResponse({
                    data: [
                        {
                            id: 1,
                            name: 'help center 1',
                            type: 'faq',
                        },
                    ],
                }),
            } as any)

            const store = {
                storeName: 'My Store',
                helpCenterId: null,
                scopes: [AiAgentScope.Support, AiAgentScope.Sales],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const { result, rerender } = renderUseStoreActivations({
                storeConfigurations: [store],
            })

            expect(result.current.storeActivations['My Store'].alerts).toEqual([
                {
                    kind: KNOWLEDGE_ALERT_KIND,
                    cta: {
                        label: 'Visit Knowledge',
                        to: '/app/automation/shopify/My Store/ai-agent/knowledge',
                    },
                    message:
                        'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
                    type: 'warning',
                },
            ])

            useGetHelpCenterListMock.mockReturnValueOnce({
                status: 'success',
                data: axiosSuccessResponse({
                    data: [
                        {
                            id: 1,
                            name: 'help center 1',
                            type: 'faq',
                        },
                        {
                            id: 2,
                            name: 'help center 1',
                            type: 'faq',
                        },
                    ],
                }),
            } as any)
            rerender({
                storeConfigurations: [store],
            })
            expect(result.current.storeActivations['My Store'].alerts).toEqual([
                {
                    kind: KNOWLEDGE_ALERT_KIND,
                    cta: {
                        label: 'Visit Knowledge',
                        to: '/app/automation/shopify/My Store/ai-agent/knowledge',
                    },
                    message:
                        'At least one knowledge source required. Update your knowledge tab to be able to activate AI Agent.',
                    type: 'warning',
                },
            ])
        })
    })

    describe('when user clicks on Save button', () => {
        it('should log the event ai-agent-activate-close-activation-modal', () => {
            const store = {
                storeName: 'My Store',
                scopes: [AiAgentScope.Support],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: new Date().toISOString(),
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [
                    { id: 2, email: 'foo@example.com' },
                ],
            } as any as StoreConfiguration

            const { result } = renderUseStoreActivations({
                storeConfigurations: [store],
            })

            act(() => {
                result.current.onSave()
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                'ai-agent-activate-close-activation-modal',
                {
                    page: pageName,
                    reason: 'clicked-on-save-button',
                },
            )
        })
    })
})
