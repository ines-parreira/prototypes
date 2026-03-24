import type { GuidanceTemplate } from 'pages/aiAgent/types'
import type { Components } from 'rest_api/help_center_api/client.generated'

export enum IntentStatus {
    Linked = 'linked',
    NotLinked = 'not_linked',
    Handover = 'handover',
}

export type Intent = Components.Schemas.IntentResponseDto

export type SkillTemplate = {
    id: string
    name: string
    guidanceId: string
    guidance?: GuidanceTemplate
    tag: string
    style: { color: string; background: string }
    intents: Intent[]
}

export type IntentResponseDto = Components.Schemas.IntentResponseDto
export type ArticleInIntentDto = Components.Schemas.ArticleInIntentDto

/**
 * Metrics for a skill article
 */
export interface SkillMetrics {
    /** Number of tickets where this skill was used */
    tickets: number | null
    /** Number of handover tickets */
    handoverTickets: number | null
    /** Average CSAT score */
    csat: number | null
    /** Resource source set ID (required for drilldown) */
    resourceSourceSetId: number
}

/**
 * Transformed article-first view of skills data
 */
export interface TransformedArticle {
    /** Article ID */
    id: number
    /** Article title */
    title: string
    /** All intents linked to this article */
    intents: Array<{
        name: IntentResponseDto['name']
        formattedName: string
    }>
    /** Published version configuration (if exists) */
    publishedVersion?: ArticleVersion
    /** Draft version configuration (if exists) */
    draftVersion?: ArticleVersion
    /** Status (enabled/disabled) */
    status: 'enabled' | 'disabled'
    /** Metrics data (if loaded) */
    metrics?: SkillMetrics
}

export interface ArticleVersion {
    /** Locale of this version */
    locale: string
    /** Article translation version ID */
    article_translation_version_id: number
}
