import React, {ComponentProps} from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {render} from '@testing-library/react'
import _noop from 'lodash/noop'

import {emptyRuleRecipeFixture} from '../../../../../fixtures/ruleRecipe'
import {RuleRecipeTag} from '../../../../../models/ruleRecipe/types'
import RuleLibrary from '../RuleLibrary'

describe('<RuleLibrary/>', () => {
    const mockStore = configureMockStore([thunk])
    const defaultStore = mockStore({
        entities: {},
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
        onInstall: _noop,
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
    })
})
