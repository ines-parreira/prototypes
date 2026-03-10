import type { Article, Category, LocaleCode } from 'models/helpCenter/types'
import { CustomerVisibilityEnum } from 'models/helpCenter/types'
import { isNonRootCategory } from 'state/entities/helpCenter/categories'

import { MAX_CATEGORY_DEPTH } from '../../constants'
import type { FlatAlgoliaSearchResults } from '../../providers/SearchContext'
import type {
    AlgoliaHit,
    EntitiesArticleRecord,
    EntitiesCategoryRecord,
    NestedParentCategory,
} from '../../types/algolia'
import { isArticleAlgoliaHit, isCategoryAlgoliaHit } from '../../types/algolia'
import type {
    SearchResult,
    SearchResultCategory,
    SearchResultsTree,
} from './types'
import {
    isLoading,
    isSearchResultArticle,
    isSearchResultCategory,
} from './types'

const createCategorySearchResultById = (
    id: number,
    categoriesById: Record<string, Category>,
): SearchResultCategory => {
    const category = categoriesById[id.toString()] ?? 'loading'

    if (!isLoading(category) && !isNonRootCategory(category)) {
        // this should never happen, it is just a safeguard
        // we need a translation to display a category, and the root category has none as it is invisible
        throw new Error(
            'the root category cannot be made into a search result!',
        )
    }

    return {
        type: 'category',
        id,
        category,
        algoliaHits: {},
        children: [],
    }
}

const newSearchResultFromAlgolia = (
    algoliaHit: AlgoliaHit<EntitiesArticleRecord | EntitiesCategoryRecord>,
    categoriesById: Record<string, Category>,
    articlesById: Record<string, Article>,
): SearchResult => {
    if (isArticleAlgoliaHit(algoliaHit)) {
        return {
            type: 'article',
            id: algoliaHit.id,
            article: articlesById[algoliaHit.id.toString()] ?? 'loading',
            algoliaHits: { [algoliaHit.locale]: algoliaHit },
        }
    }

    return {
        ...createCategorySearchResultById(algoliaHit.id, categoriesById),
        algoliaHits: { [algoliaHit.locale]: algoliaHit },
    }
}

const getNthParent = (
    hit: AlgoliaHit<EntitiesArticleRecord | EntitiesCategoryRecord>,
    parentDepth: number,
): NestedParentCategory => {
    // the `as unknown as Record<string, NestedParentCategory>` hack
    // is the only way to get parent_category_X programmatically,
    // the alternative being to hardcode parent_category_1, parent_category_2, etc
    const parentNth: NestedParentCategory | undefined = (
        hit as unknown as Record<string, NestedParentCategory>
    )[`parent_category_${parentDepth}`]

    return parentNth ?? null
}

const getMissingEntitiesFromList = (
    results: SearchResult[],
): {
    missingArticlesIds: Set<number>
    missingCategoriesIds: Set<number>
} => {
    const missingArticlesIds = new Set<number>()
    const missingCategoriesIds = new Set<number>()

    for (const result of results) {
        if (isSearchResultArticle(result) && isLoading(result.article)) {
            missingArticlesIds.add(result.id)
        } else if (isSearchResultCategory(result)) {
            if (isLoading(result.category)) {
                missingCategoriesIds.add(result.id)
            }

            const missingChildren = getMissingEntitiesFromList(result.children)

            missingChildren.missingCategoriesIds.forEach((categoryId) =>
                missingCategoriesIds.add(categoryId),
            )

            missingChildren.missingArticlesIds.forEach((articleId) =>
                missingArticlesIds.add(articleId),
            )
        }
    }

    return {
        missingArticlesIds,
        missingCategoriesIds,
    }
}

export const getMissingEntities = (
    resultsTree: SearchResultsTree,
): {
    missingArticlesIds: Set<number>
    missingCategoriesIds: Set<number>
} => {
    const { missingArticlesIds, missingCategoriesIds } =
        getMissingEntitiesFromList(resultsTree.categorized)

    for (const article of resultsTree.uncategorized) {
        if (isLoading(article.article)) {
            missingArticlesIds.add(article.id)
        }
    }

    return {
        missingArticlesIds,
        missingCategoriesIds,
    }
}

export const searchResultsTreeFromAlgolia = (
    flatAlgoliaSearchResults: FlatAlgoliaSearchResults,
    categoriesById: Record<string, Category>,
    articlesById: Record<string, Article>,
): SearchResultsTree => {
    const allResults: Array<SearchResult> = []

    for (const algoliaHit of flatAlgoliaSearchResults) {
        let resultsDepthNth = allResults

        for (
            let parentDepth = MAX_CATEGORY_DEPTH;
            parentDepth > 0;
            parentDepth--
        ) {
            const parentBreadcrumbNth = getNthParent(algoliaHit, parentDepth)

            if (parentBreadcrumbNth === null) {
                continue
            }

            let parentInResults = resultsDepthNth.find(
                (result): result is SearchResultCategory =>
                    isSearchResultCategory(result) &&
                    result.id === parentBreadcrumbNth.id,
            )

            if (parentInResults === undefined) {
                parentInResults = createCategorySearchResultById(
                    parentBreadcrumbNth.id,
                    categoriesById,
                )

                resultsDepthNth.push(parentInResults)
            }

            resultsDepthNth = parentInResults.children
        }

        const existingSearchResult = resultsDepthNth.find(
            ({ id, type }) => type === algoliaHit.type && id === algoliaHit.id,
        )

        if (existingSearchResult === undefined) {
            const searchResult = newSearchResultFromAlgolia(
                algoliaHit,
                categoriesById,
                articlesById,
            )

            resultsDepthNth.push(searchResult)

            continue
        }

        if (
            isSearchResultCategory(existingSearchResult) &&
            isCategoryAlgoliaHit(algoliaHit)
        ) {
            existingSearchResult.algoliaHits[algoliaHit.locale] = algoliaHit
        } else if (
            isSearchResultArticle(existingSearchResult) &&
            isArticleAlgoliaHit(algoliaHit)
        ) {
            existingSearchResult.algoliaHits[algoliaHit.locale] = algoliaHit
        }
    }

    return {
        uncategorized: allResults.filter(isSearchResultArticle),
        categorized: allResults.filter(isSearchResultCategory),
    }
}

export const isResultOrAncestorUnlisted = (
    result: SearchResult,
    locale: LocaleCode,
) => {
    const hit = result.algoliaHits[locale]
    if (hit === undefined) {
        return false
    }

    let hasUnlistedAncestor = false
    for (let parentNth = 1; ; parentNth++) {
        const parentBreadcrumb = getNthParent(hit, parentNth)
        if (parentBreadcrumb === null) {
            break
        }

        if (
            parentBreadcrumb.customer_visibility ===
            CustomerVisibilityEnum.UNLISTED
        ) {
            hasUnlistedAncestor = true
            break
        }
    }

    return (
        hasUnlistedAncestor ||
        hit.customer_visibility === CustomerVisibilityEnum.UNLISTED
    )
}
