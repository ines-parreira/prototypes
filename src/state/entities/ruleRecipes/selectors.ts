import {createSelector} from 'reselect'

import {RootState} from '../../types'

import {RuleRecipesState} from './types'

export const ruleRecipes = (state: RootState): RuleRecipesState =>
    state.entities.ruleRecipes || {}

export const getSortedRuleRecipes = createSelector(ruleRecipes, (recipes) =>
    Object.values(recipes).sort(
        (left, right) =>
            (right.triggered_count || 0) - (left.triggered_count || 0)
    )
)
