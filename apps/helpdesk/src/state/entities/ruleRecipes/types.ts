import type { PayloadActionCreator } from '@reduxjs/toolkit'

import type { RuleRecipe } from 'models/ruleRecipe/types'

import type { RULE_RECIPES_FETCHED } from './constants'

export type RuleRecipesState = { [slug: string]: RuleRecipe }

export type RuleRecipesFetched = PayloadActionCreator<
    RuleRecipe[],
    typeof RULE_RECIPES_FETCHED
>
