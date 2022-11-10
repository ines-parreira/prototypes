import {useEffect} from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {fetchRuleRecipes} from 'models/ruleRecipe/resources'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {ruleRecipesFetched} from './actions'
import {ruleRecipes} from './selectors'
import {RuleRecipesState} from './types'

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
            } catch (error) {
                void dispatch(
                    notify({
                        message: 'Failed to fetch rules templates',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }
    }, [dispatch, recipes])

    return Object.keys(recipes).length ? recipes : null
}
