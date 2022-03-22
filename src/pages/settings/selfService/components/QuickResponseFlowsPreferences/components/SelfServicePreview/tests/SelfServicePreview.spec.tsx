import React from 'react'
import {Provider} from 'react-redux'
import {screen, render} from '@testing-library/react'
import {useParams, useRouteMatch} from 'react-router-dom'
import thunk from 'redux-thunk'
import MockDate from 'mockdate'
import {fromJS} from 'immutable'

import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from '../../../../../../../../state/types'
import {billingState} from '../../../../../../../../fixtures/billing'
import {account} from '../../../../../../../../fixtures/account'
import {ShopType} from '../../../../../../../../models/selfServiceConfiguration/types'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useParamsMock = useParams as jest.MockedFunction<typeof useParams>
const useRouteMatchMock = useRouteMatch as jest.MockedFunction<
    typeof useRouteMatch
>
jest.mock('react-router')

import SelfServicePreview from '../SelfServicePreview'

describe('<SelfServicePreview />', () => {
    const defaultState = {
        currentAccount: fromJS(account),
        billing: fromJS(billingState),
        entities: {
            auditLogEvents: {},
            macros: {},
            rules: {},
            ruleRecipes: {},
            sections: {},
            stats: {},
            tags: {},
            views: {},
            viewsCount: {},
            helpCenter: {
                articles: {
                    articlesById: {},
                },
                categories: {
                    categoriesById: {},
                    positions: [],
                },
                helpCenters: {
                    helpCentersById: {},
                },
            },
            selfServiceConfigurations: {
                1: {
                    id: 1,
                    type: 'shopify' as ShopType,
                    shop_name: `mystore1`,
                    created_datetime: '2021-01-26T00:29:00Z',
                    updated_datetime: '2021-01-26T00:29:30Z',
                    deactivated_datetime: '2021-01-26T00:30:00Z',
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
                    quick_response_policies: [
                        {title: 'First', deactivated_datetime: null},
                        {title: 'Second', deactivated_datetime: null},
                        {title: 'Third', deactivated_datetime: null},
                        {title: 'Fourth', deactivated_datetime: null},
                        {
                            title: 'Fifth',
                            deactivated_datetime: '2020-01-01T00:00:00Z',
                        },
                    ],
                },
            },
            phoneNumbers: {},
        },
        integrations: fromJS({
            integrations: fromJS([
                {
                    id: 1,
                    type: 'shopify',
                    name: 'mystore1',
                    meta: {
                        shop_name: `mystore1`,
                    },
                    uri: `/api/integrations/1/`,
                },
                {
                    id: 2,
                    type: 'gorgias_chat',
                    name: 'My awesome chat',
                    meta: {
                        language: 'en-US',
                        shop_type: 'shopify',
                        shop_integration_id: 1,
                    },
                    decoration: {
                        avatar_type: 'team-members',
                        avatar_team_picture_url: '',
                        introduction_text: 'How can we help?',
                        main_color: '#000000',
                        position: {
                            offsetX: 0,
                            offsetY: 0,
                            alignment: 'bottom-right',
                        },
                    },
                },
            ]),
        }),
    }

    const date = '2021-01-24T17:30:00.000Z'

    beforeEach(() => {
        useParamsMock.mockReturnValue({
            shopName: 'mystore1',
            integrationType: 'shopify',
        })
        useRouteMatchMock.mockReturnValue({
            params: {
                shopName: 'mystore1',
                integrationType: 'shopify',
            },
            isExact: true,
            path: '',
            url: '',
        })
        MockDate.set(date)
    })

    afterEach(() => {
        MockDate.reset()
    })

    it('should render preview according to corresponding chat integration', () => {
        const state = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    status: 'active',
                },
            }),
        }

        render(
            <Provider store={mockStore(state)}>
                <SelfServicePreview />
            </Provider>
        )

        screen.getByText('My awesome chat')
    })

    it('should fallback to default if no corresponding chat found', () => {
        const state = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    status: 'active',
                },
            }),
            integrations: fromJS({
                integrations: fromJS([
                    {
                        id: 1,
                        type: 'shopify',
                        name: 'mystore1',
                        meta: {
                            shop_name: `mystore1`,
                        },
                        uri: `/api/integrations/1/`,
                    },
                ]),
            }),
        }

        render(
            <Provider store={mockStore(state)}>
                <SelfServicePreview />
            </Provider>
        )

        screen.getByText('Chat')
    })
})
