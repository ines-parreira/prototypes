import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {render, screen} from '@testing-library/react'

import {emptyRuleRecipeFixture} from 'fixtures/ruleRecipe'
import {rule as ruleFixture} from 'fixtures/rule'
import {billingState} from 'fixtures/billing'
import {RuleRecipeTag} from 'models/ruleRecipe/types'
import {account} from 'fixtures/account'
import RuleLibrary from '../RuleLibrary'

describe('<RuleLibrary/>', () => {
    const mockStore = configureMockStore([thunk])
    const defaultStore = mockStore({
        entities: {},
        billing: fromJS(billingState),
        currentAccount: fromJS(account),
    })
    const minProps: ComponentProps<typeof RuleLibrary> = {
        recipes: [
            {
                ...emptyRuleRecipeFixture,
                slug: 'foo',
                recipe_tag: RuleRecipeTag.AUTO_CLOSE,
            },
            {
                ...emptyRuleRecipeFixture,
                slug: 'bar',
                recipe_tag: RuleRecipeTag.AUTO_TAG,
            },
        ],
        selectedTags: [],
        searchTerm: '',
        isReady: true,
        rules: [ruleFixture],
    }
    describe('render', () => {
        it('should render cards for the library', () => {
            const {container} = render(
                <Provider store={defaultStore}>
                    <RuleLibrary {...minProps} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should filter cards for the library', () => {
            const {container} = render(
                <Provider store={defaultStore}>
                    <RuleLibrary
                        {...minProps}
                        selectedTags={[RuleRecipeTag.AUTO_TAG]}
                    />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render automation subscribe button', () => {
            render(
                <Provider store={defaultStore}>
                    <RuleLibrary {...minProps} />
                </Provider>
            )
            expect(screen.queryByText(/Get Automation Features/)).toBeTruthy()
        })
    })
})
