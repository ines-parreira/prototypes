import React, {useCallback, useEffect, useState} from 'react'
import classnames from 'classnames'

import {useHistory} from 'react-router-dom'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {ManagedRule, Rule, RuleType} from 'state/rules/types'
import {RuleRecipe} from 'models/ruleRecipe/types'

import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'

import {SegmentEvent, logEvent} from 'common/segment'
import RuleRecipeCard from './components/RuleRecipeCard'

import css from './RuleLibrary.less'
import {RuleTemplateRecipeSlugs} from './constants'

export type Props = {
    recipes: RuleRecipe[]
    searchTerm: string
    activeSlug?: string
    isReady: boolean
    autoInstall?: boolean
    rules: (Rule | ManagedRule)[]
}

export function RuleLibrary({
    recipes,
    searchTerm,
    isReady,
    rules,
    activeSlug = '',
}: Props) {
    const history = useHistory()
    const hasAutomate = useAppSelector(getHasAutomate)
    const [filteredRecipes, setFilteredRecipes] = useState(recipes)
    const [installedSlugs, setInstalledSlugs] = useState<string[]>([])

    const filterRecipes = useCallback(() => {
        return recipes.filter((recipe) => {
            let includedInSearch = true
            if (searchTerm) {
                includedInSearch =
                    recipe.rule.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (recipe.rule.description || '')
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            }

            return includedInSearch
        })
    }, [recipes, searchTerm])

    useEffect(() => {
        setFilteredRecipes(filterRecipes())
    }, [recipes, searchTerm, filterRecipes])

    const isRecipeInstalled = useCallback(
        (recipe: RuleRecipe) => {
            return !!rules.find((rule: Rule) => {
                const formattedName = recipe.recipe_tag
                    ? `[${recipe.recipe_tag}] ${recipe.rule.name}`
                    : `${recipe.rule.name}`
                return (
                    formattedName === rule.name &&
                    recipe.rule.code === rule.code &&
                    rule.event_types === recipe.rule.event_types
                )
            })
        },
        [rules]
    )

    useEffect(
        () =>
            setInstalledSlugs(
                recipes
                    .filter((recipe) => isRecipeInstalled(recipe))
                    .map((recipe) => recipe.slug)
            ),
        [recipes, rules, isRecipeInstalled]
    )

    return (
        <div className={css.container}>
            <div className={classnames(css.libraryHeader, css.autoResponders)}>
                {!hasAutomate && (
                    <div>
                        <AutomateSubscriptionButton
                            label="Get Automate Features"
                            onClick={() => {
                                logEvent(
                                    SegmentEvent.AutomatePaywallFromRuleLibrary,
                                    {
                                        location: 'rule-library',
                                    }
                                )

                                history.push('/app/automation')
                            }}
                            position="left"
                        />
                    </div>
                )}
            </div>

            <div className={classnames(css.libraryHeader, css.ruleTemplates)}>
                <h1>Choose a template and customize it to fit your needs</h1>
            </div>

            {filteredRecipes.length ? (
                filteredRecipes
                    .filter(
                        (recipe) =>
                            (recipe.rule.type !== RuleType.Managed ||
                                recipe.slug ===
                                    RuleTemplateRecipeSlugs.AutoCloseSpamFilter) &&
                            (recipe.slug !==
                                RuleTemplateRecipeSlugs.AutoTagAiIgnore ||
                                recipe.slug ===
                                    RuleTemplateRecipeSlugs.AutoTagAiIgnore)
                    )
                    .map((recipe) => (
                        <RuleRecipeCard
                            recipe={recipe}
                            key={recipe.slug}
                            isModalOpenOnLoad={activeSlug === recipe.slug}
                            isReady={isReady}
                            isInstalled={
                                !!installedSlugs.find(
                                    (slug) => slug === recipe.slug
                                )
                            }
                        />
                    ))
            ) : (
                <div>Sorry, there is no rule matching your search...</div>
            )}
        </div>
    )
}

export default RuleLibrary
