import {createAction} from '@reduxjs/toolkit'

import {RuleRecipe} from '../../../models/ruleRecipe/types'

import {RULE_RECIPES_FETCHED} from './constants'

export const ruleRecipesFetched =
    createAction<RuleRecipe[]>(RULE_RECIPES_FETCHED)
