import {Article, LocaleCode, NonRootCategory} from 'models/helpCenter/types'
import {
    AlgoliaHit,
    EntitiesArticleRecord,
    EntitiesCategoryRecord,
} from '../../types/algolia'

export type Lazy<T> = T | 'loading'

export const isLoading = <T>(lazy: Lazy<T>): lazy is 'loading' =>
    lazy === 'loading'

export type SearchResultCategory = {
    type: 'category'
    id: number
    category: Lazy<NonRootCategory>
    algoliaHits: Partial<Record<LocaleCode, AlgoliaHit<EntitiesCategoryRecord>>>
    children: SearchResult[]
}

export type SearchResultArticle = {
    type: 'article'
    id: number
    article: Lazy<Article>
    algoliaHits: Partial<Record<LocaleCode, AlgoliaHit<EntitiesArticleRecord>>>
}

export type SearchResult = SearchResultCategory | SearchResultArticle

export const isSearchResultCategory = (
    result: SearchResult
): result is SearchResultCategory => result.type === 'category'

export const isSearchResultArticle = (
    result: SearchResult
): result is SearchResultArticle => result.type === 'article'

// contains results returned from Algolia + categories that didn't match but whose child(ren) match
export type SearchResultsTree = {
    uncategorized: Array<SearchResultArticle>
    categorized: Array<SearchResultCategory>
}
