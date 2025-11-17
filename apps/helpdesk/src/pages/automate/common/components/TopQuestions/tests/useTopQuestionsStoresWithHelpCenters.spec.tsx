import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { HelpCenter } from 'models/helpCenter/types'
import type {
    ShopifyIntegration,
    ShopifyIntegrationMeta,
} from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import type { RootState } from 'state/types'

import { useTopQuestionsStoresWithHelpCenters } from '../useTopQuestionsStoresWithHelpCenters'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'shop-1',
                meta: {
                    shop_name: 'shop-1',
                } as Omit<ShopifyIntegrationMeta, 'oauth'>,
            } as ShopifyIntegration,
            {
                id: 2,
                type: IntegrationType.Shopify,
                name: 'shop-2',
                meta: {
                    shop_name: 'shop-2',
                } as Omit<ShopifyIntegrationMeta, 'oauth'>,
            } as ShopifyIntegration,
            {
                id: 3,
                type: IntegrationType.Shopify,
                name: 'shop-3',
                meta: {
                    shop_name: 'shop-3',
                } as Omit<ShopifyIntegrationMeta, 'oauth'>,
            } as ShopifyIntegration,
        ],
    }),
} as RootState

const mockStore = configureMockStore([thunk])(defaultState)

const helpCenters = [
    {
        shop_name: 'shop-1',
        name: 'the-good-help-center',
        type: 'faq',
    },
    {
        shop_name: 'shop-1',
        name: 'the-great-help-center',
        type: 'faq',
    },
    {
        shop_name: 'shop-2',
        name: 'the-better-help-center',
        type: 'faq',
    },
    {
        shop_name: 'shop-2',
        name: 'the-best-help-center',
        type: 'faq',
    },
    {
        shop_name: 'shop-3',
        name: 'the-utmost-greatest-help-center',
        type: 'faq',
    },
    {
        shop_name: 'shop-4',
        name: 'the-help-center-that-should-not-be',
        type: 'faq',
    },
    {
        name: 'the-orphan-help-center',
        type: 'faq',
    },
] as Partial<HelpCenter>[]

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList')
const mockUseHelpCenterList = assumeMock(useHelpCenterList)

describe('useTopQuestionsStoresWithHelpCenters', () => {
    beforeEach(() => {
        mockStore.clearActions()
        jest.resetAllMocks()
    })

    it('returns stores with help centers', () => {
        mockUseHelpCenterList.mockReturnValue({
            helpCenters: helpCenters as HelpCenter[],
            isLoading: false,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        const { result } = renderHook(
            () => useTopQuestionsStoresWithHelpCenters(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isLoading: false,
            storesWithHelpCenters: [
                {
                    store: {
                        id: 1,
                        type: IntegrationType.Shopify,
                        name: 'shop-1',
                        meta: {
                            shop_name: 'shop-1',
                        },
                    },
                    helpCenters: [
                        {
                            shop_name: 'shop-1',
                            name: 'the-good-help-center',
                            type: 'faq',
                        },
                        {
                            shop_name: 'shop-1',
                            name: 'the-great-help-center',
                            type: 'faq',
                        },
                    ],
                },
                {
                    store: {
                        id: 2,
                        type: IntegrationType.Shopify,
                        name: 'shop-2',
                        meta: {
                            shop_name: 'shop-2',
                        },
                    },
                    helpCenters: [
                        {
                            shop_name: 'shop-2',
                            name: 'the-better-help-center',
                            type: 'faq',
                        },
                        {
                            shop_name: 'shop-2',
                            name: 'the-best-help-center',
                            type: 'faq',
                        },
                    ],
                },
                {
                    store: {
                        id: 3,
                        type: IntegrationType.Shopify,
                        name: 'shop-3',
                        meta: {
                            shop_name: 'shop-3',
                        },
                    },
                    helpCenters: [
                        {
                            shop_name: 'shop-3',
                            name: 'the-utmost-greatest-help-center',
                            type: 'faq',
                        },
                    ],
                },
            ],
        })

        expect(mockUseHelpCenterList).toHaveBeenCalledTimes(1)

        expect(mockUseHelpCenterList).toHaveBeenCalledWith({
            per_page: HELP_CENTER_MAX_CREATION,
            type: 'faq',
        })
    })

    it('ignores stores with 0 help center', () => {
        mockUseHelpCenterList.mockReturnValue({
            helpCenters: helpCenters.filter(
                ({ shop_name }) => shop_name !== 'shop-2',
            ) as HelpCenter[],
            isLoading: false,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        const { result } = renderHook(
            () => useTopQuestionsStoresWithHelpCenters(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isLoading: false,
            storesWithHelpCenters: [
                {
                    store: {
                        id: 1,
                        type: IntegrationType.Shopify,
                        name: 'shop-1',
                        meta: {
                            shop_name: 'shop-1',
                        },
                    },
                    helpCenters: [
                        {
                            shop_name: 'shop-1',
                            name: 'the-good-help-center',
                            type: 'faq',
                        },
                        {
                            shop_name: 'shop-1',
                            name: 'the-great-help-center',
                            type: 'faq',
                        },
                    ],
                },
                {
                    store: {
                        id: 3,
                        type: IntegrationType.Shopify,
                        name: 'shop-3',
                        meta: {
                            shop_name: 'shop-3',
                        },
                    },
                    helpCenters: [
                        {
                            shop_name: 'shop-3',
                            name: 'the-utmost-greatest-help-center',
                            type: 'faq',
                        },
                    ],
                },
            ],
        })
    })

    it('returns isLoading when help centers are loading', () => {
        mockUseHelpCenterList.mockReturnValue({
            helpCenters: helpCenters as HelpCenter[],
            isLoading: true,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        const { result } = renderHook(
            () => useTopQuestionsStoresWithHelpCenters(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isLoading: true,
            storesWithHelpCenters: [],
        })
    })
})
