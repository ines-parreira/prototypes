import {Hit} from '@algolia/client-search'

import {LocaleCode, VisibilityStatus} from 'models/helpCenter/types'

export type AlgoliaHit<T> = Hit<T>

/*
 * This file is basically a copy of help-center file https://github.com/gorgias/help-center/blob/main/apps/api/src/modules/algolia/types/entities-index.type.ts
 */

export type AlgoliaRecordTags =
    | 'current'
    | 'latest_draft'
    | 'level1'
    | 'level2'
    | 'level3'

export type EntitiesBaseRecord = {
    objectID: string
    id: number
    help_center_id: number
    locale: LocaleCode

    title: string
    title_draft: string
    slug: string
    slug_draft: string
    preview: string
    preview_draft: string

    gorgias_domain: string
    custom_domain: string

    parent_category_1: NestedParentCategory
    parent_category_2: NestedParentCategory
    parent_category_3: NestedParentCategory

    visibility_status: VisibilityStatus
}

export type ParentCategoryFieldVisibilityStatus = VisibilityStatus

export type NestedParentCategory = {
    id: number
    title: string
    description: string
    visibility_status: ParentCategoryFieldVisibilityStatus
} | null

export type EntitiesArticleRecord = EntitiesBaseRecord & {
    type: 'article'

    article_content: string
    article_content_draft: string

    parent_category_4: NestedParentCategory

    _tags: (AlgoliaRecordTags | 'level4')[]
}

export type EntitiesCategoryRecord = EntitiesBaseRecord & {
    type: 'category'

    _tags: AlgoliaRecordTags[]
}

export type EntitiesRecord = EntitiesArticleRecord | EntitiesCategoryRecord

export type AlgoliaSearchResult<T> = {
    results: AlgoliaHit<T>[]
    resultsCount: number
    nbPages: number
}

export const isArticleAlgoliaHit = (
    hit: AlgoliaHit<EntitiesArticleRecord | EntitiesCategoryRecord>
): hit is AlgoliaHit<EntitiesArticleRecord> => hit.type === 'article'

export const isCategoryAlgoliaHit = (
    hit: AlgoliaHit<EntitiesArticleRecord | EntitiesCategoryRecord>
): hit is AlgoliaHit<EntitiesCategoryRecord> => hit.type === 'category'
