import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'

import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {Provider} from 'react-redux'
import React, {ComponentType} from 'react'
import {waitFor} from '@testing-library/react'
import {RootState, StoreDispatch} from 'state/types'
import client from 'models/api/resources'
import {IntegrationType} from 'models/integration/constants'
import {
    hasShopifyIntegrationSSPEnabled,
    useIsArticleRecommendationDisabled,
} from '../self-service-stats.utils'
import {ShopType} from '../../../../models/selfServiceConfiguration/types'
import {ShopifyIntegration} from '../../../../models/integration/types'

describe('hasShopifyIntegrationSSPEnabled', () => {
    it('should return true if for the shopifyIntegration passed theres a corresponding SSP configuration enabled', () => {
        const shopifyIntegration = {
            id: 1,
            type: IntegrationType.Shopify,
            meta: {
                shop_name: `mystore1`,
            },
            uri: `/api/integrations/1/`,
        } as ShopifyIntegration
        const sspConfigurations = [
            {
                id: 1,
                type: 'shopify' as ShopType,
                shop_name: `mystore1`,
                created_datetime: '2021-01-26T00:29:00Z',
                updated_datetime: '2021-01-26T00:29:30Z',
                deactivated_datetime: null,
                report_issue_policy: {
                    enabled: true,
                    cases: [],
                },
                track_order_policy: {
                    enabled: true,
                },
                cancel_order_policy: {
                    enabled: true,
                    eligibilities: [],
                    exceptions: [],
                },
                return_order_policy: {
                    enabled: true,
                    eligibilities: [],
                    exceptions: [],
                },
                quick_response_policies: [],
            },
        ]
        expect(
            hasShopifyIntegrationSSPEnabled(
                shopifyIntegration,
                sspConfigurations
            )
        ).toBe(true)
    })

    it('should return false if', () => {
        const shopifyIntegration = {
            id: 1,
            type: IntegrationType.Shopify,
            meta: {
                shop_name: `mystore1`,
            },
            uri: `/api/integrations/1/`,
        } as ShopifyIntegration
        const sspConfigurations = [
            {
                id: 1,
                type: 'shopify' as ShopType,
                shop_name: `mystore1`,
                created_datetime: '2021-01-26T00:29:00Z',
                updated_datetime: '2021-01-26T00:29:30Z',
                deactivated_datetime: '2021-01-26T00:29:30Z',
                report_issue_policy: {
                    enabled: true,
                    cases: [],
                },
                track_order_policy: {
                    enabled: true,
                },
                cancel_order_policy: {
                    enabled: true,
                    eligibilities: [],
                    exceptions: [],
                },
                return_order_policy: {
                    enabled: true,
                    eligibilities: [],
                    exceptions: [],
                },
                quick_response_policies: [],
            },
        ]
        expect(
            hasShopifyIntegrationSSPEnabled(
                shopifyIntegration,
                sspConfigurations
            )
        ).toBe(false)
    })
})

describe('useIsArticleRecommendationDisabled', () => {
    const mockStore = configureMockStore<RootState, StoreDispatch>()

    const mockServer = new MockAdapter(client)
    const mockState = {
        integrations: fromJS({
            integrations: [
                {
                    type: IntegrationType.GorgiasChat,
                    meta: {app_id: 1},
                },
                {
                    type: IntegrationType.GorgiasChat,
                    meta: {app_id: 2},
                },
            ],
        }),
    } as RootState

    beforeEach(() => {
        mockServer.reset()
        jest.clearAllMocks()
        mockServer.onGet('/api/chat_help_center/1').reply(200, {
            chat_application_id: 1,
            enabled: false,
            help_center_id: 1,
            id: 1,
        })
    })

    it('Should return true if article recommendation is disabled from all chat', async () => {
        mockServer.onGet('/api/chat_help_center/2').reply(200, {
            chat_application_id: 2,
            enabled: false,
            help_center_id: 2,
            id: 2,
        })

        const {result} = renderHook(
            () => useIsArticleRecommendationDisabled(true),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(mockState)}>{children}</Provider>
                )) as ComponentType,
            }
        )

        await waitFor(() => {
            expect(mockServer.history.get.length).toBe(2)
            expect(result.current).toBe(true)
        })
    })
    it('Should return false if article recommendation is activated in at least one chat', async () => {
        mockServer.onGet('/api/chat_help_center/2').reply(200, {
            chat_application_id: 2,
            enabled: true,
            help_center_id: 2,
            id: 2,
        })

        const {result} = renderHook(
            () => useIsArticleRecommendationDisabled(true),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(mockState)}>{children}</Provider>
                )) as ComponentType,
            }
        )

        await waitFor(() => {
            expect(mockServer.history.get.length).toBe(2)
            expect(result.current).toBe(false)
        })
    })
    it('Should not fetch and return false if "shouldFetch" is set to false', () => {
        const {result} = renderHook(
            () => useIsArticleRecommendationDisabled(false),
            {
                wrapper: (({children}) => (
                    <Provider store={mockStore(mockState)}>{children}</Provider>
                )) as ComponentType,
            }
        )

        expect(mockServer.history.get.length).toBe(0)
        expect(result.current).toBe(false)
    })
})
