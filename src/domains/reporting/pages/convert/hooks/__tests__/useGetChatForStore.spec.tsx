import React, { ComponentType } from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { useGetChatForStore } from 'domains/reporting/pages/convert/hooks/useGetChatForStore'
import { IntegrationType } from 'models/integration/types'
import { RootState } from 'state/types'
import { renderHook } from 'utils/testing/renderHook'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
            },
            {
                id: 2,
                type: IntegrationType.Shopify,
            },
            {
                id: 3,
                type: IntegrationType.GorgiasChat,
                meta: {
                    shop_integration_id: 1,
                    shopify_integration_ids: [1],
                },
            },
            {
                id: 4,
                type: IntegrationType.GorgiasChat,
                meta: {
                    shop_integration_id: 1,
                },
            },
            {
                id: 5,
                type: IntegrationType.Shopify,
            },
            {
                id: 6,
                type: IntegrationType.GorgiasChat,
                meta: {
                    shop_integration_id: 5,
                },
            },
        ],
    }),
} as RootState

const store = createStore((state) => state as RootState, defaultState)
const hookOptions = {
    wrapper: (({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    )) as ComponentType,
}

describe('useGetChatForStore', () => {
    describe('when there is a chat integration', () => {
        it('returns the chat integration', () => {
            const { result } = renderHook(
                () => useGetChatForStore(1),
                hookOptions,
            )

            expect(result.current).toEqual({
                id: 3,
                type: IntegrationType.GorgiasChat,
                meta: {
                    shop_integration_id: 1,
                    shopify_integration_ids: [1],
                },
            })
        })

        it('returns first linked chat', () => {
            const { result } = renderHook(
                () => useGetChatForStore(5),
                hookOptions,
            )

            expect(result.current).toEqual({
                id: 6,
                type: IntegrationType.GorgiasChat,
                meta: {
                    shop_integration_id: 5,
                },
            })
        })
    })

    describe('when there is no chat integration', () => {
        it('returns undefined', () => {
            const { result } = renderHook(
                () => useGetChatForStore(2),
                hookOptions,
            )

            expect(result.current).toBeUndefined()
        })
    })
})
