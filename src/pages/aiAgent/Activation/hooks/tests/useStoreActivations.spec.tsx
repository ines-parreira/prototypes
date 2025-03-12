import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-hooks/dom'

import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const queryClient = mockQueryClient()

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
            }),
        {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        },
    )

describe('useStoreActivations', () => {
    describe('when store has no scope + has no deactivated datetime for chat and email', () => {
        it('should have a score of 0 / 3', () => {
            const store = {
                storeName: 'My Store',
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

            expect(result.current.score).toEqual({
                currentScore: 0,
                totalScore: 3,
            })
        })

        describe('when store has monitored chat and email integration', () => {
            const store = {
                storeName: 'My Store',
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

        describe('when store has monitored chat + no monitored email', () => {
            const store = {
                storeName: 'My Store',
                scopes: [],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [1],
                monitoredEmailIntegrations: [],
            } as any as StoreConfiguration

            const expectedInitialState = {
                name: 'My Store',
                title: 'My Store',
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
                storeName: 'My Store',
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
                storeName: 'My Store',
                scopes: [],
                chatChannelDeactivatedDatetime: null,
                emailChannelDeactivatedDatetime: null,
                monitoredChatIntegrations: [],
                monitoredEmailIntegrations: [],
            } as any as StoreConfiguration

            const expectedInitialState = {
                name: 'My Store',
                title: 'My Store',
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

            expect(result.current.score).toEqual({
                currentScore: 1,
                totalScore: 3,
            })
        })
    })

    describe('when store has Support scope + deactivated datetime for chat + deactivated datetime for email', () => {
        it('should have a score of 0 / 3', () => {
            const store = {
                storeName: 'My Store',
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

            expect(result.current.score).toEqual({
                currentScore: 0,
                totalScore: 3,
            })
        })
    })

    describe('when store has Support scope + no deactivated datetime for chat + for email', () => {
        it('should have a score of 2 / 3', () => {
            const store = {
                storeName: 'My Store',
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

            expect(result.current.score).toEqual({
                currentScore: 2,
                totalScore: 3,
            })
        })
    })

    describe('when store has Support + Sales scope + no deactivated datetime for chat + for email', () => {
        it('should have a score of 3 / 3', () => {
            const store = {
                storeName: 'My Store',
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

            expect(result.current.score).toEqual({
                currentScore: 3,
                totalScore: 3,
            })
        })
    })
})
