import client from '../api/resources'
import type { ApiListResponse } from '../api/types'
import type { RuleRecipe } from './types'

export const fetchRuleRecipes = async (): Promise<
    ApiListResponse<RuleRecipe[], null>
> => {
    const res = await client.get('/api/rule-recipes/')
    return res.data as ApiListResponse<RuleRecipe[], null>
}
