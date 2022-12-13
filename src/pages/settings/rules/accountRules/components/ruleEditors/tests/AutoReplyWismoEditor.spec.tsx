import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
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
})
