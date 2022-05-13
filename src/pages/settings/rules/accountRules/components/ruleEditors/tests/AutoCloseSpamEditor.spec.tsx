import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {ManagedRulesSlugs} from 'state/rules/types'
import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'

import AutoCloseSpamEditor from '../AutoCloseSpamEditor'
jest.mock(
    'pages/settings/rules/accountRules/components/ruleEditors/LinkToRecipeView',
    () => () => <>Link</>
)

describe('<AutoCloseSpamEditor/>', () => {
    const minProps: ComponentProps<typeof AutoCloseSpamEditor> = {
        settings: {
            slug: ManagedRulesSlugs.AutoCloseSpam,
            allow_list: [],
            block_list: [],
        },
        onChange: jest.fn(),
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        entities: {
            ruleRecipes: {
                [ManagedRulesSlugs.AutoCloseSpam as string]:
                    emptyRuleRecipeFixture,
            },
        },
    } as RootState)

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render correctly', () => {
        const {container} = render(
            <Provider store={store}>
                <AutoCloseSpamEditor {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
