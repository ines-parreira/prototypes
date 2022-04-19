import React, {ReactNode, useEffect} from 'react'
import {Link} from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {fetchRuleRecipes} from 'models/ruleRecipe/resources'
import {ruleRecipesFetched} from 'state/entities/ruleRecipes/actions'
import {ruleRecipes} from 'state/entities/ruleRecipes/selectors'
import {getTicketViews} from 'state/entities/views/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

type Props = {
    recipeSlug: string
    children: ReactNode
}
export const LinkToRecipeView = ({recipeSlug, children}: Props) => {
    const recipes = useAppSelector(ruleRecipes)
    const allViews = useAppSelector(getTicketViews)
    const dispatch = useAppDispatch()
    const handleFetch = async () => {
        try {
            const ruleRecipes = await fetchRuleRecipes()
            void dispatch(ruleRecipesFetched(ruleRecipes.data))
        } catch {
            void dispatch(
                notify({
                    message: 'Could not fetch rule recipes',
                    status: NotificationStatus.Error,
                })
            )
        }
    }
    useEffect(() => {
        if (!recipes.length) {
            void handleFetch()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const recipe = recipes[recipeSlug]
    if (recipe) {
        const recipeView = recipes[recipeSlug]?.views_per_section['none'][0]
        const existingView = allViews.filter(
            (view) =>
                view.slug === recipeView.slug ||
                view.filters === recipeView.filters
        )

        const linkTo = {
            pathname: '',
            state: {},
        }
        if (existingView.length) {
            linkTo.pathname = `/app/tickets/${existingView[0].id}`
        } else {
            linkTo.pathname = `/app/tickets/new/public`
            linkTo.state = {
                filters: recipeView.filters,
                viewName: recipeView.name,
                slug: recipeView.slug,
            }
        }

        return <Link to={linkTo}>{children}</Link>
    }
    return <></>
}

export default LinkToRecipeView
