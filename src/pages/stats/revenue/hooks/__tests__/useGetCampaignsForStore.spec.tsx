import React, {ComponentType} from 'react'
import {createStore} from 'redux'
import {Provider} from 'react-redux'

import {fromJS} from 'immutable'

import {renderHook} from '@testing-library/react-hooks'

import {RootState} from 'state/types'

import {IntegrationType} from 'models/integration/types'

import {useGetCampaignsForStore} from '../useGetCampaignsForStore'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Gmail,
            },
            {
                id: 2,
                type: IntegrationType.Shopify,
            },
            {
                id: 3,
                type: IntegrationType.Shopify,
            },
            {
                id: 4,
                type: IntegrationType.GorgiasChat,
                meta: {
                    shop_integration_id: 2,
                    campaigns: [
                        {
                            id: '123',
                            name: 'some campaign',
                        },
                        {
                            id: '456',
                            name: 'another campaign',
                        },
                    ],
                },
            },
        ],
    }),
} as RootState

describe('useGetCampaignsForStore', () => {
    describe('no integration is selected', () => {
        it('returns an empty list', () => {
            const store = createStore(
                (state) => state as RootState,
                defaultState
            )
            const hookOptions = {
                wrapper: (({children}) => (
                    <Provider store={store}>{children}</Provider>
                )) as ComponentType,
            }
            const {result} = renderHook(
                () => useGetCampaignsForStore([]),
                hookOptions
            )

            expect(result.current).toEqual([])
        })
    })

    describe('a shopify integration without chats is selected', () => {
        it('returns an empty list', () => {
            const store = createStore(
                (state) => state as RootState,
                defaultState
            )
            const hookOptions = {
                wrapper: (({children}) => (
                    <Provider store={store}>{children}</Provider>
                )) as ComponentType,
            }
            const {result} = renderHook(
                () => useGetCampaignsForStore([3]),
                hookOptions
            )

            expect(result.current).toEqual([])
        })
    })

    describe('a shopify integration with chat is selected', () => {
        it('returns the ordered campaigns from the chat', () => {
            const store = createStore(
                (state) => state as RootState,
                defaultState
            )
            const hookOptions = {
                wrapper: (({children}) => (
                    <Provider store={store}>{children}</Provider>
                )) as ComponentType,
            }
            const {result} = renderHook(
                () => useGetCampaignsForStore([2]),
                hookOptions
            )

            expect(result.current).toEqual([
                {
                    id: '456',
                    name: 'another campaign',
                },
                {
                    id: '123',
                    name: 'some campaign',
                },
            ])
        })
    })
})
