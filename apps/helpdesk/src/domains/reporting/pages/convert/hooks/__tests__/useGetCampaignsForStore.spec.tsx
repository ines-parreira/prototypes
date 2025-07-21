import React, { ComponentType } from 'react'

import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { useGetCampaignsForStore } from 'domains/reporting/pages/convert/hooks/useGetCampaignsForStore'
import { campaign } from 'fixtures/campaign'
import { channelConnection } from 'fixtures/channelConnection'
import { useListCampaigns } from 'models/convert/campaign/queries'
import { IntegrationType } from 'models/integration/types'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { RootState } from 'state/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)

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
                    app_id: '123',
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
    beforeEach(() => {
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
        useListCampaignMock.mockReturnValue({
            data: [],
        } as any)
    })

    describe('no integration is selected and no request is called', () => {
        it('returns an empty list', () => {
            // simulate hook not being enabled
            useListCampaignMock.mockReturnValue({
                data: undefined,
            } as any)
            const store = createStore(
                (state) => state as RootState,
                defaultState,
            )
            const hookOptions = {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={store}>{children}</Provider>
                )) as ComponentType,
            }
            const { result } = renderHook(
                () => useGetCampaignsForStore([]),
                hookOptions,
            )

            expect(result.current).toEqual({
                campaigns: [],
                channelConnectionExternalIds: [],
            })
        })
    })

    describe('a shopify integration without chats is selected', () => {
        it('returns an empty list', () => {
            const store = createStore(
                (state) => state as RootState,
                defaultState,
            )
            const hookOptions = {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={store}>{children}</Provider>
                )) as ComponentType,
            }
            const { result } = renderHook(
                () => useGetCampaignsForStore([3]),
                hookOptions,
            )

            expect(result.current).toEqual({
                campaigns: [],
                channelConnectionExternalIds: [],
            })
        })
    })

    describe('a shopify integration with chat is selected', () => {
        it('returns the ordered campaigns from the api', () => {
            useListCampaignMock.mockReturnValue({
                data: [campaign],
            } as any)

            const store = createStore(
                (state) => state as RootState,
                defaultState,
            )
            const hookOptions = {
                wrapper: (({ children }: { children: React.ReactNode }) => (
                    <Provider store={store}>{children}</Provider>
                )) as ComponentType,
            }
            const { result } = renderHook(
                () => useGetCampaignsForStore([2]),
                hookOptions,
            )

            expect(result.current).toEqual({
                campaigns: [campaign],
                channelConnectionExternalIds: ['123'],
            })
        })
    })
})
