import { createAction } from '@reduxjs/toolkit'

import type { RuleRecipe } from '../../../models/ruleRecipe/types'
import { RULE_RECIPES_FETCHED } from './constants'

export const ruleRecipesFetched =
    createAction<RuleRecipe[]>(RULE_RECIPES_FETCHED)
