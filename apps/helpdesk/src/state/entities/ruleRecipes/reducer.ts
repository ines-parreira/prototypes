import { createReducer } from '@reduxjs/toolkit'

import { ruleRecipesFetched } from './actions'
import type { RuleRecipesState } from './types'

const initialState: RuleRecipesState = {}

const ruleRecipesReducer = createReducer<RuleRecipesState>(
    initialState,
    (builder) =>
        builder.addCase(ruleRecipesFetched, (state, { payload }) => {
            payload.map((ruleRecipe) => {
                state[ruleRecipe.slug] = ruleRecipe
            })
        }),
)

export default ruleRecipesReducer
