import React, {useEffect, useState} from 'react'

import {useAsyncFn} from 'react-use'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getTicketViews} from 'state/entities/views/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {createTag, fetchTags} from 'models/tag/resources'
import history from 'pages/history'
import {TagDraft} from 'models/tag/types'
import {tagCreated} from 'state/entities/tags/actions'
import Button from 'pages/common/components/button/Button'
import {useRuleRecipes} from 'state/entities/ruleRecipes/hooks'

type Props = {
    recipeSlug: string
}
export const AutoresponderViewButton = ({recipeSlug}: Props) => {
    const allViews = useAppSelector(getTicketViews)
    const dispatch = useAppDispatch()
    const recipes = useRuleRecipes()
    const [hasErrors, setHasErrors] = useState(false)

    const recipe = recipes![recipeSlug]

    const checkMissingTags = (tag: TagDraft): Promise<TagDraft | null> =>
        new Promise((resolve, reject) => {
            fetchTags({search: tag.name})
                .then((resp) => {
                    if (!resp.data.data.length) {
                        resolve(tag)
                    }
                    resolve(null)
                })
                .catch(() => reject())
        })

    const [{loading: isFetchingTags, value: missingTags}, handleFetchTags] =
        useAsyncFn(async () => {
            if (!recipe) return
            try {
                const tags = (
                    await Promise.all(
                        recipe.tags.map((tag) => checkMissingTags(tag))
                    )
                ).filter((tag) => !!tag)
                return tags as TagDraft[]
            } catch (e) {
                void dispatch(
                    notify({
                        message: 'Could not fetch tags',
                        status: NotificationStatus.Error,
                    })
                )
                setHasErrors(true)
            }
        }, [recipe])

    useEffect(() => {
        void handleFetchTags()
    }, [handleFetchTags])

    const handleCreateTag = (tag: TagDraft) =>
        new Promise((resolve, reject) => {
            createTag(tag)
                .then((newTag) => {
                    dispatch(tagCreated(newTag))
                    resolve(newTag)
                })
                .catch((e) => reject(e))
        })

    const handleClick = async () => {
        const recipeView = recipe?.views_per_section['none'][0]
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

        if (missingTags && missingTags.length) {
            await Promise.all(
                missingTags.map((tag) => handleCreateTag(tag))
            ).catch(() => {
                void dispatch(
                    notify({
                        message: 'Could not create all tags',
                        status: NotificationStatus.Error,
                    })
                )
                setHasErrors(true)
            })
        }

        history.push(linkTo)
    }

    return (
        <Button
            onClick={handleClick}
            intent="secondary"
            disabled={isFetchingTags || hasErrors}
        >
            View Tickets Closed By Rule
        </Button>
    )
}

export default AutoresponderViewButton
