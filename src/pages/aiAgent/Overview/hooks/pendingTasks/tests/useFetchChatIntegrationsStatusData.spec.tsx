import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { AiAgentOverviewRootStateFixture } from 'pages/aiAgent/Overview/tests/AiAgentOverviewRootState.fixture'
import { getInstallationStatus } from 'state/integrations/actions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useFetchChatIntegrationsStatusData } from '../useFetchChatIntegrationsStatusData'

const queryClient = mockQueryClient()

jest.mock('state/integrations/actions', () => ({
    getInstallationStatus: jest.fn(),
}))
const getInstallationStatusMock = assumeMock(getInstallationStatus)

describe('useFetchChatIntegrationsStatusData', () => {
    it('should do nothing if no chatIds given', () => {
        const rootState = AiAgentOverviewRootStateFixture.start().build()
        const hook = renderHook(
            () =>
                useFetchChatIntegrationsStatusData({
                    enabled: true,
                    chatIds: [],
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={configureMockStore()(rootState)}>
                            {children}
                        </Provider>
                    </QueryClientProvider>
                ),
            },
        )

        expect(hook.result.current).toEqual({
            data: undefined,
            isLoading: true,
            isFetched: false,
        })
    })

    it('should return chat integration with status and filter out non existing ones', async () => {
        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration()
            .build()

        getInstallationStatusMock.mockResolvedValue({
            applicationId: 1,
            hasBeenRequestedOnce: true,
            installed: true,
            installedOnShopifyCheckout: false,
            minimumSnippetVersion: 'v3' as any,
        })

        const hook = renderHook(
            () =>
                useFetchChatIntegrationsStatusData({
                    enabled: true,
                    chatIds: [1, 2, 4],
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={configureMockStore()(rootState)}>
                            {children}
                        </Provider>
                    </QueryClientProvider>
                ),
            },
        )

        await waitFor(() => hook.result.current.isLoading === false)
        hook.rerender()
        expect(hook.result.current).toEqual({
            data: [
                {
                    applicationId: 1,
                    chatId: 1,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    minimumSnippetVersion: 'v3',
                },
                {
                    applicationId: 1,
                    chatId: 2,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    minimumSnippetVersion: 'v3',
                },
            ],
            isLoading: false,
            isFetched: true,
        })
    })

    it('should return chat integration ordered by updated date, older first', async () => {
        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration({ updatedAt: '2021-01-05T00:00:00Z' })
            .withChatIntegration({ updatedAt: '2021-01-01T00:00:00Z' })
            .withChatIntegration({ updatedAt: '2021-01-06T00:00:00Z' })
            .build()

        getInstallationStatusMock.mockResolvedValue({
            applicationId: 1,
            hasBeenRequestedOnce: true,
            installed: true,
            installedOnShopifyCheckout: false,
            minimumSnippetVersion: 'v3' as any,
        })

        const hook = renderHook(
            () =>
                useFetchChatIntegrationsStatusData({
                    enabled: true,
                    chatIds: [1, 2, 3],
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={configureMockStore()(rootState)}>
                            {children}
                        </Provider>
                    </QueryClientProvider>
                ),
            },
        )

        await waitFor(() => hook.result.current.isLoading === false)
        hook.rerender()
        expect(hook.result.current).toEqual({
            data: [
                {
                    applicationId: 1,
                    chatId: 2,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    minimumSnippetVersion: 'v3',
                },
                {
                    applicationId: 1,
                    chatId: 1,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    minimumSnippetVersion: 'v3',
                },
                {
                    applicationId: 1,
                    chatId: 3,
                    hasBeenRequestedOnce: true,
                    installed: true,
                    installedOnShopifyCheckout: false,
                    minimumSnippetVersion: 'v3',
                },
            ],
            isLoading: false,
            isFetched: true,
        })
    })
})
