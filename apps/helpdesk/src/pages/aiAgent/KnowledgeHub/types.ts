import type { History } from 'history'

import type { IconName } from '@gorgias/axiom'

import type { LocaleCode } from 'models/helpCenter/types'
import { VisibilityStatusEnum } from 'models/helpCenter/types'

export enum KnowledgeType {
    Document = 'document',
    FAQ = 'faq',
    Guidance = 'guidance',
    URL = 'url',
    Domain = 'domain',
}

export enum KnowledgeVisibility {
    UNLISTED = 'unlisted',
    PUBLIC = 'public',
}

export type KnowledgeItem = {
    type: KnowledgeType
    title: string
    lastUpdatedAt: string
    inUseByAI?: KnowledgeVisibility
    source?: string
    id: string
    localeCode?: LocaleCode
    actionsCount?: number
    content?: string
    draftVersionId?: number | null
    publishedVersionId?: number | null
}

export type KnowledgeMetrics = {
    tickets: number | null
    handoverTickets: number | null
    csat: number | null
    resourceSourceSetId: number
}

export type GroupedKnowledgeItem = KnowledgeItem & {
    isGrouped?: boolean
    itemCount?: number
    metrics?: KnowledgeMetrics
}

export const typeConfig: Record<
    KnowledgeType,
    { icon: IconName; label: string }
> = {
    [KnowledgeType.Document]: {
        icon: 'paperclip-attachment',
        label: 'Documents',
    },
    [KnowledgeType.FAQ]: {
        icon: 'file-document',
        label: 'Help Center articles',
    },
    [KnowledgeType.Guidance]: { icon: 'nav-map', label: 'Guidance' },
    [KnowledgeType.URL]: { icon: 'link-horizontal', label: 'URLs' },
    [KnowledgeType.Domain]: { icon: 'nav-globe', label: 'Store website' },
}

export enum SnippetType {
    URL = 'url',
    Document = 'document',
    Store = 'store',
}

export const mapKnowledgeTypeToSnippetType = (
    knowledgeType: KnowledgeType,
): SnippetType => {
    switch (knowledgeType) {
        case KnowledgeType.URL:
            return SnippetType.URL
        case KnowledgeType.Document:
            return SnippetType.Document
        case KnowledgeType.Domain:
            return SnippetType.Store
        default:
            throw new Error(
                `Invalid KnowledgeType for snippet: ${knowledgeType}`,
            )
    }
}

export const mapSnippetTypeToKnowledgeType = (
    snippetType: SnippetType,
): KnowledgeType => {
    switch (snippetType) {
        case SnippetType.URL:
            return KnowledgeType.URL
        case SnippetType.Document:
            return KnowledgeType.Document
        case SnippetType.Store:
            return KnowledgeType.Domain
    }
}

/**
 * Maps KnowledgeVisibility enum value to FilteredKnowledgeHubArticle visibility type
 */
export const mapKnowledgeVisibilityToArticleVisibility = (
    visibility?: KnowledgeVisibility,
): 'PUBLIC' | 'UNLISTED' => {
    return visibility === KnowledgeVisibility.PUBLIC
        ? VisibilityStatusEnum.PUBLIC
        : VisibilityStatusEnum.UNLISTED
}

export type EditorType = 'guidance' | 'faq' | 'snippet'
export type EditorMode = 'create' | 'read' | 'edit'

/**
 * Base type for filtered knowledge articles with core properties
 * Used across guidance, FAQ, and snippet article filtering
 */
export type FilteredKnowledgeHubArticle = {
    id: number
    title: string
    draftVersionId?: number | null
    publishedVersionId?: number | null
    visibility: 'PUBLIC' | 'UNLISTED'
}

/**
 * Extended type for snippet articles that require a type property
 * Includes all base filtered properties plus the required KnowledgeType
 */
export type FilteredKnowledgeItemArticle = FilteredKnowledgeHubArticle & {
    type: KnowledgeType
}

export type GuidanceEditorConfig = {
    type: 'guidance'
    shopName: string
    shopType: string
    filteredArticles: Array<FilteredKnowledgeHubArticle>
}

export type FaqEditorConfig = {
    type: 'faq'
    shopName: string
    filteredArticles: Array<FilteredKnowledgeHubArticle>
}

export type SnippetEditorConfig = {
    type: 'snippet'
    shopName: string
    filteredArticles: Array<FilteredKnowledgeHubArticle>
}

export type KnowledgeEditorConfig =
    | GuidanceEditorConfig
    | FaqEditorConfig
    | SnippetEditorConfig

export type UseKnowledgeHubSnippetEditorParams = {
    shopName: string
    filteredSnippetArticles: FilteredKnowledgeItemArticle[]
    history: History
    routes: {
        knowledgeArticle: (type: string, id: number) => string
    }
    buildUrlWithParams: (basePath: string) => string
}
