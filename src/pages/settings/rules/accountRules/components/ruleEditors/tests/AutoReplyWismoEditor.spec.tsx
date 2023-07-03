import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from 'state/types'
import {ManagedRulesSlugs} from 'state/rules/types'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'

import {IntegrationType} from 'models/integration/constants'
import AutoReplyWismoEditor from '../AutoReplyWismoEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('<AutoReplyWismoEditor/>', () => {
    const minProps: ComponentProps<typeof AutoReplyWismoEditor> = {
        settings: {
            slug: ManagedRulesSlugs.AutoReplyWismo,
            block_list: [],
            body_text: '{{tracking_link_url}}',
            signature_text: '{{current_user.name}}',
        },
        onChange: jest.fn(),
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const entities = {
        ruleRecipes: {
            [ManagedRulesSlugs.AutoReplyWismo as string]:
                emptyRuleRecipeFixture,
        },
        helpCenter: {articles: {}, categories: {}, helpCenters: {}},
        selfServiceConfigurations: {},
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render correctly', () => {
        const store = mockStore({
            entities: entities,
            integrations: fromJS({
                integrations: [{type: IntegrationType.Shopify, meta: {}}],
            }),
        } as RootState)
        const {container} = render(
            <Provider store={store}>
                <AutoReplyWismoEditor {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display an alert if no shopify integration', () => {
        const store = mockStore({
            entities: entities,
            integrations: fromJS({
                integrations: [],
            }),
        } as RootState)
        const {container} = render(
            <Provider store={store}>
                <AutoReplyWismoEditor {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should display an alert if track order flow is enabled without unfulffiled message', async () => {
        const store = mockStore({
            entities: {
                ...entities,
                selfServiceConfigurations: {
                    '0': {
                        id: 1,
                        type: IntegrationType.Shopify,
                        shop_name: 'test-shop',
                        created_datetime: '2023-11-15 19:00:00.000000',
                        updated_datetime: '2023-11-15 19:00:00.000000',
                        deactivated_datetime: null,
                        report_issue_policy: {
                            enabled: true,
                            cases: [],
                        },
                        track_order_policy: {
                            enabled: true,
                            unfulfilled_message: {
                                text: '',
                                html: '',
                            },
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
                        article_recommendation_help_center_id: null,
                    },
                },
            },
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        type: 'shopify',
                    },
                ],
            }),
        } as unknown as RootState)

        render(
            <Provider store={store}>
                <AutoReplyWismoEditor {...minProps} />
            </Provider>
        )
        await screen.findByText(
            /add a response for customers tracking unfulfilled orders/i
        )
    })
})
