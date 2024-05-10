import React, {useCallback, useEffect, useState} from 'react'
import classnames from 'classnames'

import {useHistory} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import {ManagedRule, Rule, RuleType} from 'state/rules/types'
import {RuleRecipe} from 'models/ruleRecipe/types'

import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'

import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import RuleRecipeCard from './components/RuleRecipeCard'

import css from './RuleLibrary.less'
import {RuleTemplateRecipeSlugs} from './constants'

export type Props = {
    recipes: RuleRecipe[]
    searchTerm: string
    selectedTags: string[]
    activeSlug?: string
    isReady: boolean
    autoInstall?: boolean
    rules: (Rule | ManagedRule)[]
}

export function RuleLibrary({
    recipes,
    selectedTags,
    searchTerm,
    isReady,
    rules,
    activeSlug = '',
    autoInstall,
}: Props) {
    const history = useHistory()
    const hasAutomate = useAppSelector(getHasAutomate)
    const [filteredRecipes, setFilteredRecipes] = useState(recipes)
    const [installedSlugs, setInstalledSlugs] = useState<string[]>([])
    const [installedManagedRules, setInstalledManagedRules] = useState<
        string[]
    >([])
    const hasAiAgentRuleTemplate: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentRuleTemplate]

    const filterRecipes = useCallback(() => {
        return recipes.filter((recipe) => {
            let includedInSearch = true
            let includedInTags = true
            if (searchTerm) {
                includedInSearch =
                    recipe.rule.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (recipe.rule.description || '')
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            }
            if (selectedTags.length) {
                includedInTags = !!selectedTags.find(
                    (tag) => tag === recipe.recipe_tag
                )
            }
            return includedInSearch && includedInTags
        })
    }, [recipes, searchTerm, selectedTags])

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

    useEffect(
        () =>
            setInstalledManagedRules(
                rules
                    .filter((rule) => rule.type === RuleType.Managed)
                    .map(
                        (rule) => (rule as ManagedRule).settings.slug as string
                    )
            ),
        [rules]
    )

    return (
        <div className={css.container}>
            <div className={classnames(css.libraryHeader, css.autoResponders)}>
                <div>
                    <h1>
                        <i className="material-icons mr-2">auto_awesome</i>
                        Autoresponders
                    </h1>
                    <p>
                        Install autoresponders to leverage AI to resolve
                        tickets. Available only to Automate subscribers.
                    </p>
                </div>
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
            {filteredRecipes.length ? (
                filteredRecipes
                    .filter((recipe) => recipe.rule.type === RuleType.Managed)
                    .map((recipe) => (
                        <RuleRecipeCard
                            recipe={recipe}
                            key={recipe.slug}
                            isModalOpenOnLoad={activeSlug === recipe.slug}
                            isReady={isReady}
                            autoInstall={
                                autoInstall && activeSlug === recipe.slug
                            }
                            isInstalled={
                                !!installedManagedRules.find(
                                    (slug) => slug === recipe.slug
                                )
                            }
                        />
                    ))
            ) : (
                <div>Sorry, there is no rule matching your search...</div>
            )}
            <div className={classnames(css.libraryHeader, css.ruleTemplates)}>
                <h1>Rule Templates</h1>
                <p>
                    Install and adapt rule templates to streamline your team’s
                    workflow.
                </p>
                <a
                    href="https://docs.gorgias.com/en-US/rule-library-new-81974"
                    target="_blank"
                    rel="noreferrer"
                >
                    <i className="material-icons mr-2">menu_book</i>
                    Learn About Rule Templates
                </a>
            </div>
            {filteredRecipes.length ? (
                filteredRecipes
                    .filter(
                        (recipe) =>
                            recipe.rule.type !== RuleType.Managed &&
                            (recipe.slug !==
                                RuleTemplateRecipeSlugs.AutoTagAiIgnore ||
                                (recipe.slug ===
                                    RuleTemplateRecipeSlugs.AutoTagAiIgnore &&
                                    hasAiAgentRuleTemplate))
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
