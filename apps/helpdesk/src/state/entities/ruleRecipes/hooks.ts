import { useEffect } from 'react'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { fetchRuleRecipes } from 'models/ruleRecipe/resources'

import { ruleRecipesFetched } from './actions'
import { ruleRecipes } from './selectors'
import type { RuleRecipesState } from './types'

let loading = false

export const useRuleRecipes = (): RuleRecipesState | null => {
    const dispatch = useAppDispatch()
    const recipes = useAppSelector(ruleRecipes)

    useEffect(() => {
        if (!Object.keys(recipes).length && !loading) {
            try {
                loading = true
                void fetchRuleRecipes().then((res) => {
                    dispatch(ruleRecipesFetched(res.data))
                    loading = false
                })
            } catch {
                toast.error('Failed to fetch rules templates')
            }
        }
    }, [dispatch, recipes])

    return Object.keys(recipes).length ? recipes : null
}
