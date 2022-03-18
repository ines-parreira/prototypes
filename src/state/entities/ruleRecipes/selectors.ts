import {createSelector} from 'reselect'

import {RuleType} from 'models/rule/types'

import {RootState} from '../../types'
import {RuleRecipesState} from './types'

export const ruleRecipes = (state: RootState): RuleRecipesState =>
    state.entities.ruleRecipes || {}

export const getSortedRuleRecipes = createSelector(ruleRecipes, (recipes) =>
    Object.values(recipes).sort((left, right) => {
        if (left.rule.type === right.rule.type) {
            return (right.triggered_count || 0) - (left.triggered_count || 0)
        } else if (left.rule.type === RuleType.Managed) {
            return -1
        }
        return 1
    })
)
