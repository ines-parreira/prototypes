import {emptyRuleRecipeFixture as recipe} from '../../../../fixtures/ruleRecipe'

import {ruleRecipesFetched} from '../actions'
import reducer from '../reducer'

describe('rule recipe reducer', () => {
    describe('ruleRecipesFetched action', () => {
        it('should set the state to the data', () => {
            const newState = reducer({}, ruleRecipesFetched([recipe]))
            expect(newState).toStrictEqual({[recipe.slug]: recipe})
        })
    })
})
