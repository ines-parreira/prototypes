import client from '../api/resources'
import {ApiListResponse} from '../api/types'

import {RuleRecipe} from './types'

export const fetchRuleRecipes = async (): Promise<
    ApiListResponse<RuleRecipe[], null>
> => {
    const res = await client.get('/api/rule-recipes/')
    return res.data as ApiListResponse<RuleRecipe[], null>
}
