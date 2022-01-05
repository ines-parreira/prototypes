import {PayloadActionCreator} from '@reduxjs/toolkit'

import {RuleRecipe} from '../../../models/ruleRecipe/types'

import {RULE_RECIPES_FETCHED} from './constants'

export type RuleRecipesState = {[slug: string]: RuleRecipe}

export type RuleRecipesFetched = PayloadActionCreator<
    RuleRecipe[],
    typeof RULE_RECIPES_FETCHED
>
