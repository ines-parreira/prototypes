import {emptyRuleRecipeFixture as recipe} from '../../../../fixtures/ruleRecipe'
import {RootState} from '../../../types'

import {getSortedRuleRecipes} from '../selectors'
import {RuleRecipesState} from '../types'

describe('rules recipes selectors', () => {
    describe('getSortedRulesRecipes', () => {
        const rulesRecipesState = {
            foo: {...recipe, triggered_count: 100},
            bar: {...recipe, triggered_count: 20},
            baz: {...recipe, triggered_count: 200},
        } as RuleRecipesState

        const state: RootState = {
            entities: {
                ruleRecipes: rulesRecipesState,
            },
        } as any

        it('should return the sorted list of rules recipes by priority', () => {
            expect(getSortedRuleRecipes(state)).toMatchSnapshot()
        })
    })
})
