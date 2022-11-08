import {useEffect, useState} from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {fetchRuleRecipes} from 'models/ruleRecipe/resources'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {ruleRecipesFetched} from './actions'
import {ruleRecipes} from './selectors'
import {RuleRecipesState} from './types'

export const useRuleRecipes = (): [boolean, RuleRecipesState] => {
    const dispatch = useAppDispatch()
    const recipes = useAppSelector(ruleRecipes)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!Object.keys(recipes).length && !loading) {
            try {
                setLoading(true)
                void fetchRuleRecipes().then((res) => {
                    dispatch(ruleRecipesFetched(res.data))
                    setLoading(false)
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
    }, [dispatch, recipes, loading])

    return [loading, recipes]
}
