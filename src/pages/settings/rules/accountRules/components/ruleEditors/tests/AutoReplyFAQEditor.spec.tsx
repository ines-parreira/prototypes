import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {ManagedRulesSlugs} from 'state/rules/types'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'

import AutoReplyFAQEditor from '../AutoReplyFAQEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')
jest.mock(
    'pages/settings/rules/accountRules/components/ruleEditors/LinkToRecipeView',
    () => () => <p>Link to view</p>
)

describe('<AutoReplyFAQEditor/>', () => {
    const minProps: ComponentProps<typeof AutoReplyFAQEditor> = {
        settings: {
            slug: ManagedRulesSlugs.AutoReplyWismo,
            block_list: [],
        },
        onChange: jest.fn(),
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const entities = {
        ruleRecipes: {
            [ManagedRulesSlugs.AutoReplyFAQ as string]: emptyRuleRecipeFixture,
        },
        helpCenter: {articles: {}, categories: {}, helpCenters: {}},
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render correctly', () => {
        const store = mockStore({
            entities: entities,
        } as RootState)
        const {container} = render(
            <Provider store={store}>
                <AutoReplyFAQEditor {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
