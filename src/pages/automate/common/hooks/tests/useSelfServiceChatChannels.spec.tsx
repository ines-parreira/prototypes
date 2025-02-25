import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { AiAgentOverviewRootStateFixture } from 'pages/aiAgent/Overview/tests/AiAgentOverviewRootState.fixture'

import useSelfServiceChatChannels from '../useSelfServiceChatChannels'
import useSelfServiceStoreIntegration from '../useSelfServiceStoreIntegration'

jest.mock('../useSelfServiceStoreIntegration')
const useSelfServiceStoreIntegrationMock =
    useSelfServiceStoreIntegration as jest.Mock

describe('useSelfServiceChatChannels', () => {
    const shopType = 'shopify'
    const shopName = 'My Shop'

    it('returns an empty array if storeIntegration is undefined', () => {
        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration()
            .build()

        useSelfServiceStoreIntegrationMock.mockReturnValue(undefined)

        const hook = renderHook(
            () => useSelfServiceChatChannels(shopType, shopName),
            {
                wrapper: ({ children }) => (
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(hook.result.current).toEqual([])
    })

    it('returns an empty array if there is no chat integration', () => {
        const mockedStoreIntegration = { id: 'storeIntegration123' }

        const rootState = AiAgentOverviewRootStateFixture.start().build()

        useSelfServiceStoreIntegrationMock.mockReturnValue(
            mockedStoreIntegration,
        )

        const hook = renderHook(
            () => useSelfServiceChatChannels(shopType, shopName),
            {
                wrapper: ({ children }) => (
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(hook.result.current).toEqual([])
    })

    it('returns only published chat integrations for the store by default', () => {
        const mockedStoreIntegration = { id: 'storeIntegration123' }

        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration({ isDraft: true })
            .build()

        useSelfServiceStoreIntegrationMock.mockReturnValue(
            mockedStoreIntegration,
        )

        const hook = renderHook(
            () => useSelfServiceChatChannels(shopType, shopName),
            {
                wrapper: ({ children }) => (
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(hook.result.current).toHaveLength(3)
    })

    it('returns all chat integrations for the store if showDrafts is true', () => {
        const mockedStoreIntegration = { id: 'storeIntegration123' }

        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration({ isDraft: true })
            .build()

        useSelfServiceStoreIntegrationMock.mockReturnValue(
            mockedStoreIntegration,
        )

        const hook = renderHook(
            () => useSelfServiceChatChannels(shopType, shopName, true),
            {
                wrapper: ({ children }) => (
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(hook.result.current).toHaveLength(4)
    })

    it('handles changes in showDraftChats prop', () => {
        const mockedStoreIntegration = { id: 'storeIntegration123' }

        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration({ isDraft: true })
            .build()

        useSelfServiceStoreIntegrationMock.mockReturnValue(
            mockedStoreIntegration,
        )

        const hook = renderHook(
            ({ showDrafts }) =>
                useSelfServiceChatChannels(shopType, shopName, showDrafts),
            {
                initialProps: { showDrafts: false },
                wrapper: ({ children }) => (
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(hook.result.current).toHaveLength(2) // Only published

        hook.rerender({ showDrafts: true })

        expect(hook.result.current).toHaveLength(3) // Published + draft
    })
})
