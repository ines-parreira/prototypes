import React, {useCallback, useEffect, useState} from 'react'
import _noop from 'lodash/noop'
import classnames from 'classnames'

import {Rule} from 'state/rules/types'
import {RuleRecipe} from 'models/ruleRecipe/types'

import RuleRecipeCard from './components/RuleRecipeCard'

import css from './RuleLibrary.less'

export type Props = {
    recipes: RuleRecipe[]
    searchTerm: string
    selectedTags: string[]
    activeSlug?: string
    onInstall: (rule: Rule) => void
    isReady: boolean
}

export function RuleLibrary({
    recipes,
    selectedTags,
    searchTerm,
    isReady,
    activeSlug = '',
    onInstall = _noop,
}: Props) {
    const [filteredRecipes, setFilteredRecipes] = useState(recipes)

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

    return (
        <>
            <div className={classnames('page-container', css.container)}>
                {filteredRecipes.length ? (
                    filteredRecipes.map((recipe) => (
                        <RuleRecipeCard
                            recipe={recipe}
                            key={recipe.slug}
                            onInstall={onInstall}
                            isModalOpenOnLoad={activeSlug === recipe.slug}
                            isReady={isReady}
                        />
                    ))
                ) : (
                    <div>Sorry, there is no rule matching your search...</div>
                )}
            </div>
        </>
    )
}

export default RuleLibrary
