import {createReducer} from '@reduxjs/toolkit'

import {RuleRecipesState} from './types'
import {ruleRecipesFetched} from './actions'

const initialState: RuleRecipesState = {}

const ruleRecipesReducer = createReducer<RuleRecipesState>(
    initialState,
    (builder) =>
        builder.addCase(ruleRecipesFetched, (state, {payload}) => {
            payload.map((ruleRecipe) => {
                state[ruleRecipe.slug] = ruleRecipe
            })
        })
)

export default ruleRecipesReducer
