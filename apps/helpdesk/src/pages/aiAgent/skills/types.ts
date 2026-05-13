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
    intents: Intent[]
}

export type IntentResponseDto = Components.Schemas.IntentResponseDto
export type ArticleInIntentDto = Components.Schemas.ArticleInIntentDto

export type SkillWizardData = Components.Schemas.SkillWizardResponseDto
export type SkillWizardState = Components.Schemas.SkillWizardStateVo
export type SkillWizardSkillConfiguration =
    Components.Schemas.SkillWizardSkillConfigurationVo
export type GaiaPayload = Components.Schemas.GaiaPayloadVo
export type GaiaRecommendation = Components.Schemas.GaiaRecommendationVo
export type GaiaAnalysisPeriod = Components.Schemas.GaiaAnalysisPeriodVo

export const SkillWizardStatus = {
    NotStarted: 'not_started',
    InProgress: 'in_progress',
    Completed: 'completed',
} as const satisfies Record<string, SkillWizardData['status']>
export type SkillWizardStatus =
    (typeof SkillWizardStatus)[keyof typeof SkillWizardStatus]

export const SkillWizardStep = {
    Review: 'review',
    Recap: 'recap',
} as const satisfies Record<
    string,
    NonNullable<SkillWizardState['current_step']>
>
export type SkillWizardStep =
    (typeof SkillWizardStep)[keyof typeof SkillWizardStep]

export const SkillWizardSkillStatus = {
    Draft: 'draft',
    Approved: 'approved',
} as const satisfies Record<string, SkillWizardSkillConfiguration['status']>
export type SkillWizardSkillStatus =
    (typeof SkillWizardSkillStatus)[keyof typeof SkillWizardSkillStatus]

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
    /** Draft content body */
    content: string
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
