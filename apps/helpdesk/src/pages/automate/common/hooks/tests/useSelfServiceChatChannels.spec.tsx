import React from 'react'

import { renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import { StoreIntegration } from 'models/integration/types'
import { AiAgentOverviewRootStateFixture } from 'pages/aiAgent/Overview/tests/AiAgentOverviewRootState.fixture'
import { assumeMock } from 'utils/testing'

import useSelfServiceChatChannels, {
    useSelfServiceChatChannelsMultiStore,
} from '../useSelfServiceChatChannels'
import useSelfServiceStoreIntegration, {
    useSelfServiceStoreIntegrationMultiStore,
} from '../useSelfServiceStoreIntegration'

jest.mock('../useSelfServiceStoreIntegration')
const useSelfServiceStoreIntegrationMock =
    useSelfServiceStoreIntegration as jest.Mock
const useSelfServiceStoreIntegrationMultiStoreMock = assumeMock(
    useSelfServiceStoreIntegrationMultiStore,
)

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

describe('useSelfServiceChatChannelsMultiStore', () => {
    const shopType = SHOPIFY_INTEGRATION_TYPE
    const SHOP_NAME_1 = 'My Shop'
    const SHOP_NAME_2 = 'My Other Shop'
    const shopNames = [SHOP_NAME_1, SHOP_NAME_2]

    it('returns an empty array if storeIntegration is undefined', () => {
        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration()
            .build()

        useSelfServiceStoreIntegrationMultiStoreMock.mockReturnValue({
            [SHOP_NAME_1]: undefined,
            [SHOP_NAME_2]: undefined,
        })

        const hook = renderHook(
            () => useSelfServiceChatChannelsMultiStore(shopType, shopNames),
            {
                wrapper: ({ children }) => (
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(hook.result.current).toEqual({
            [SHOP_NAME_1]: [],
            [SHOP_NAME_2]: [],
        })
    })

    it('returns an empty array if there is no chat integration', () => {
        const mockedStoreIntegration = { id: 'storeIntegration123' }

        const rootState = AiAgentOverviewRootStateFixture.start().build()

        useSelfServiceStoreIntegrationMock.mockReturnValue(
            mockedStoreIntegration,
        )

        useSelfServiceStoreIntegrationMultiStoreMock.mockReturnValue({
            [SHOP_NAME_1]: mockedStoreIntegration as any as StoreIntegration,
            [SHOP_NAME_2]: undefined,
        })

        const hook = renderHook(
            () => useSelfServiceChatChannelsMultiStore(shopType, shopNames),
            {
                wrapper: ({ children }) => (
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(hook.result.current).toEqual({
            [SHOP_NAME_1]: [],
            [SHOP_NAME_2]: [],
        })
    })

    it('returns only published chat integrations for the store by default', () => {
        const mockedStoreIntegration = { id: 'storeIntegration123' }

        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration({ isDraft: true })
            .build()

        useSelfServiceStoreIntegrationMultiStoreMock.mockReturnValue({
            [SHOP_NAME_1]: mockedStoreIntegration as any as StoreIntegration,
            [SHOP_NAME_2]: undefined,
        })

        const hook = renderHook(
            () => useSelfServiceChatChannelsMultiStore(shopType, shopNames),
            {
                wrapper: ({ children }) => (
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(hook.result.current[SHOP_NAME_1]).toHaveLength(3)
        expect(hook.result.current[SHOP_NAME_2]).toHaveLength(0)
    })

    it('returns all chat integrations for the store if showDrafts is true', () => {
        const mockedStoreIntegration = { id: 'storeIntegration123' }

        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration({ isDraft: true })
            .build()

        useSelfServiceStoreIntegrationMultiStoreMock.mockReturnValue({
            [SHOP_NAME_1]: mockedStoreIntegration as any as StoreIntegration,
            [SHOP_NAME_2]: undefined,
        })

        const hook = renderHook(
            () =>
                useSelfServiceChatChannelsMultiStore(shopType, shopNames, true),
            {
                wrapper: ({ children }) => (
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(hook.result.current[SHOP_NAME_1]).toHaveLength(4)
        expect(hook.result.current[SHOP_NAME_2]).toHaveLength(0)
    })

    it('handles changes in showDraftChats prop', () => {
        const mockedStoreIntegration = { id: 'storeIntegration123' }

        const rootState = AiAgentOverviewRootStateFixture.start()
            .withChatIntegration()
            .withChatIntegration()
            .withChatIntegration({ isDraft: true })
            .build()

        useSelfServiceStoreIntegrationMultiStoreMock.mockReturnValue({
            [SHOP_NAME_1]: mockedStoreIntegration as any as StoreIntegration,
            [SHOP_NAME_2]: undefined,
        })

        const hook = renderHook(
            ({ showDrafts }) =>
                useSelfServiceChatChannelsMultiStore(
                    shopType,
                    shopNames,
                    showDrafts,
                ),
            {
                initialProps: { showDrafts: false },
                wrapper: ({ children }) => (
                    <Provider store={configureMockStore()(rootState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(hook.result.current[SHOP_NAME_1]).toHaveLength(2) // Only published
        expect(hook.result.current[SHOP_NAME_2]).toHaveLength(0)

        hook.rerender({ showDrafts: true })

        expect(hook.result.current[SHOP_NAME_1]).toHaveLength(3) // Published + draft
    })
})
