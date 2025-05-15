import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { GorgiasChatInstallationMethod } from 'models/integration/types'
import { AiAgentOverviewRootStateFixture } from 'pages/aiAgent/Overview/tests/AiAgentOverviewRootState.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { useFetchChatIntegrationsStatusData } from '../useFetchChatIntegrationsStatusData'

const queryClient = mockQueryClient()

describe('useFetchChatIntegrationsStatusData', () => {
    it('should return empty array when no chat integrations exist', () => {
        const rootState = AiAgentOverviewRootStateFixture.start().build()
        const hook = renderHook(() => useFetchChatIntegrationsStatusData(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                </QueryClientProvider>
            ),
        })

        expect(hook.result.current).toEqual([])
    })

    it('should return chat integrations with installation status', () => {
        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration()
            .build()

        const hook = renderHook(() => useFetchChatIntegrationsStatusData(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                </QueryClientProvider>
            ),
        })

        expect(hook.result.current).toEqual([
            {
                installed: false,
                chatId: 1,
            },
            {
                installed: false,
                chatId: 2,
            },
            {
                installed: false,
                chatId: 3,
            },
        ])
    })

    it('should return chat integrations in the order they are in the store', () => {
        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration({ updatedAt: '2021-01-05T00:00:00Z' })
            .withChatIntegration({ updatedAt: '2021-01-01T00:00:00Z' })
            .withChatIntegration({ updatedAt: '2021-01-06T00:00:00Z' })
            .build()

        const hook = renderHook(() => useFetchChatIntegrationsStatusData(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                </QueryClientProvider>
            ),
        })

        expect(hook.result.current).toEqual([
            {
                installed: false,
                chatId: 1,
            },
            {
                installed: false,
                chatId: 2,
            },
            {
                installed: false,
                chatId: 3,
            },
        ])
    })

    it('should correctly identify installed chat integrations', () => {
        // Create root state
        const rootState = AiAgentOverviewRootStateFixture.start().build()

        // Add chat integration with proper installation setup
        const installedChatIntegration = {
            id: 1,
            type: 'gorgias_chat',
            name: 'Installed Chat',
            meta: {
                app_id: 'app_id_123',
                shop_integration_id: 'storeIntegration123',
                one_click_installation_method:
                    GorgiasChatInstallationMethod.ScriptTag,
                one_click_installation_datetime: '2021-01-01T00:00:00Z',
                shopify_integration_ids: ['storeIntegration123'],
                wizard: {
                    status: 'published',
                },
            },
            updated_datetime: '2021-01-01T00:00:00Z',
        }

        // Add chat integration without proper installation setup
        const uninstalledChatIntegration = {
            id: 2,
            type: 'gorgias_chat',
            name: 'Uninstalled Chat',
            meta: {
                app_id: 'app_id_456',
                shop_integration_id: 'storeIntegration123',
                // No installation method or other required properties
                wizard: {
                    status: 'published',
                },
            },
            updated_datetime: '2021-01-02T00:00:00Z',
        }

        // Update state with custom integrations
        const updatedState = {
            ...rootState,
            integrations: rootState.integrations.set(
                'integrations',
                rootState.integrations
                    .get('integrations')
                    .push(installedChatIntegration, uninstalledChatIntegration),
            ),
        }

        const hook = renderHook(() => useFetchChatIntegrationsStatusData(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={configureMockStore()(updatedState)}>
                        {children}
                    </Provider>
                </QueryClientProvider>
            ),
        })

        expect(hook.result.current).toEqual([
            {
                installed: true, // This one should be installed
                chatId: 1,
            },
            {
                installed: false, // This one shouldn't be installed
                chatId: 2,
            },
        ])
    })
})
