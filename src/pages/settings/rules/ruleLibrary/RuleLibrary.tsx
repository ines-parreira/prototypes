import classnames from 'classnames'
import React, {useCallback, useEffect, useState} from 'react'

import {RuleRecipe} from 'models/ruleRecipe/types'
import {ManagedRule, Rule, RuleType} from 'state/rules/types'

import RuleRecipeCard from './components/RuleRecipeCard'

import {RuleTemplateRecipeSlugs} from './constants'
import css from './RuleLibrary.less'

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
    const [filteredRecipes, setFilteredRecipes] = useState(recipes)

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

    return (
        <div className={css.container}>
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
                            isInstalled={rules.some((rule) => {
                                return (
                                    'settings' in rule &&
                                    rule.settings?.slug === recipe.slug
                                )
                            })}
                        />
                    ))
            ) : (
                <div>Sorry, there is no rule matching your search...</div>
            )}
        </div>
    )
}

export default RuleLibrary
