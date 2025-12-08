import type { History } from 'history'

import type { IconName } from '@gorgias/axiom'

import type { LocaleCode } from 'models/helpCenter/types'

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
}

export type GroupedKnowledgeItem = KnowledgeItem & {
    isGrouped?: boolean
    itemCount?: number
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

export type EditorType = 'guidance' | 'faq' | 'snippet'
export type EditorMode = 'create' | 'read' | 'edit'

export type GuidanceEditorConfig = {
    type: 'guidance'
    shopName: string
    shopType: string
    filteredArticles: Array<{ id: number; title: string }>
}

export type FaqEditorConfig = {
    type: 'faq'
    shopName: string
    filteredArticles: Array<{ id: number; title: string }>
}

export type SnippetEditorConfig = {
    type: 'snippet'
    shopName: string
    filteredArticles: Array<{ id: number; title: string }>
}

export type KnowledgeEditorConfig =
    | GuidanceEditorConfig
    | FaqEditorConfig
    | SnippetEditorConfig

export type UseKnowledgeHubSnippetEditorParams = {
    shopName: string
    filteredSnippetArticles: Array<{
        id: number
        title: string
        type: KnowledgeType
    }>
    history: History
    routes: {
        knowledgeArticle: (type: string, id: number) => string
    }
    buildUrlWithParams: (basePath: string) => string
}
