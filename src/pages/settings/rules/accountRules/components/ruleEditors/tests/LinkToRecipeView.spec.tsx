import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {RootState, StoreDispatch} from 'state/types'

import LinkToRecipeView from '../LinkToRecipeView'

describe('<AutoCloseSpamEditor/>', () => {
    const minProps: ComponentProps<typeof LinkToRecipeView> = {
        recipeSlug: emptyRuleRecipeFixture.slug,
        children: <p>test</p>,
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        entities: {
            ruleRecipes: {
                [emptyRuleRecipeFixture.slug]: emptyRuleRecipeFixture,
            },
        },
    } as RootState)

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render correctly', () => {
        const {container} = render(
            <Provider store={store}>
                <LinkToRecipeView {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
