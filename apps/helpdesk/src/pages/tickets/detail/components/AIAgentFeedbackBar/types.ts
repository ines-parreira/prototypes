import { z } from 'zod'

import type {
    FeedbackExecutionsItem,
    FeedbackExecutionsItemResourcesItem,
    FindFeedbackResult,
} from '@gorgias/knowledge-service-types'

export enum TicketEventEnum {
    CLOSE = 'CLOSE',
    HANDOVER = 'handover',
    SNOOZE = 'SNOOZE',
    TAGGED = 'TAGGED',
}

export enum ResourceSection {
    ACTIONS = 'actions',
    GUIDANCE = 'guidance',
    KNOWLEDGE = 'knowledge',
}

export enum FeedbackStatus {
    SAVED = 'saved',
    SAVING = 'saving',
    ERROR = 'error',
}

export enum ActionStatus {
    NOT_CONFIRMED = 'Not confirmed',
    CONFIRMED = 'confirmed',
}

export enum AutoSaveState {
    INITIAL = 'initial',
    SAVING = 'saving',
    SAVED = 'saved',
}

export type ResourceMetadata = {
    title: string
    content: string
    url?: string
    isDeleted?: boolean
    isLoading?: boolean
    versionId?: number
}

export type FeedbackDto = FindFeedbackResult['data']

export type KnowledgeResource = {
    executionId: FeedbackExecutionsItem['executionId']
    resource: FeedbackExecutionsItemResourcesItem
    feedback?:
        | ArrayItem<FeedbackExecutionsItem['feedback']>
        | FeedbackExecutionsItemResourcesItem['feedback']
        | null
    metadata: ResourceMetadata
}

export type SuggestedResource = {
    executionId: FeedbackExecutionsItem['executionId']
    feedback: ArrayItem<FeedbackExecutionsItem['feedback']>
    parsedResource: SuggestedResourceValue
    metadata: ResourceMetadata
}

export type FreeForm = {
    executionId: FeedbackExecutionsItem['executionId']
    feedback: ArrayItem<FeedbackExecutionsItem['feedback']>
}

export type AiAgentKnowledgeResourceType =
    FeedbackExecutionsItemResourcesItem['resourceType']

export enum AiAgentKnowledgeResourceTypeEnum {
    GUIDANCE = 'GUIDANCE',
    ACTION = 'ACTION',
    ARTICLE = 'ARTICLE',
    MACRO = 'MACRO',
    EXTERNAL_SNIPPET = 'EXTERNAL_SNIPPET',
    FILE_EXTERNAL_SNIPPET = 'FILE_EXTERNAL_SNIPPET',
    STORE_WEBSITE_QUESTION_SNIPPET = 'STORE_WEBSITE_QUESTION_SNIPPET',
    ORDER = 'ORDER',
    PRODUCT_KNOWLEDGE = 'PRODUCT_KNOWLEDGE',
    PRODUCT_RECOMMENDATION = 'PRODUCT_RECOMMENDATION',
}

export enum AiAgentFeedbackTypeEnum {
    TICKET_FREEFORM = 'TICKET_FREEFORM',
    TICKET_RATING = 'TICKET_RATING',
    TICKET_BAD_INTERACTION_REASON = 'TICKET_BAD_INTERACTION_REASON',
    OPPORTUNITY_DISMISS_REASON = 'OPPORTUNITY_DISMISS_REASON',
    KNOWLEDGE_RESOURCE_BINARY = 'KNOWLEDGE_RESOURCE_BINARY',
    SUGGESTED_RESOURCE = 'SUGGESTED_RESOURCE',
    REASONING_BINARY = 'REASONING_BINARY',
}

export enum FeedbackRating {
    GOOD = 'GOOD',
    OK = 'OK',
    BAD = 'BAD',
}

export enum AiAgentBadInteractionReason {
    WRONG_KNOWLEDGE = 'WRONG_KNOWLEDGE',
    IGNORED_KNOWLEDGE = 'IGNORED_KNOWLEDGE',
    MISSING_KNOWLEDGE = 'MISSING_KNOWLEDGE',
    ACTION_NOT_PERFORMED = 'ACTION_NOT_PERFORMED',
    ACTION_INCORRECTLY_PERFORMED = 'ACTION_INCORRECTLY_PERFORMED',
    TONE_OF_VOICE_NOT_ALIGNED = 'TONE_OF_VOICE_NOT_ALIGNED',
    OVERPROMISE = 'OVERPROMISE',
    REPETITIVE_MESSAGES = 'REPETITIVE_MESSAGES',
    SHOULD_NOT_HAND_OVER = 'SHOULD_NOT_HAND_OVER',
    SHOULD_HAND_OVER_SOONER = 'SHOULD_HAND_OVER_SOONER',
    SHOULD_NOT_TRY_TO_SELL = 'SHOULD_NOT_TRY_TO_SELL',
    REPLIED_TO_HANDOVER_TOPIC = 'REPLIED_TO_HANDOVER_TOPIC',
    SHOULD_NOT_HAVE_CLOSED_TICKET = 'SHOULD_NOT_HAVE_CLOSED_TICKET',
    INCORRECT_STOCK_OR_INVENTORY_INFO = 'INCORRECT_STOCK_OR_INVENTORY_INFO',
    COULDNT_FIND_ORDER_BY_EMAIL = 'COULDNT_FIND_ORDER_BY_EMAIL',
    DISCOUNT_ISSUE = 'DISCOUNT_ISSUE',
    IRRELEVANT_PRODUCT_RECCOMENDATION = 'IRRELEVANT_PRODUCT_RECCOMENDATION',
    SOMEWHAT_RELEVANT_PRODUCT_RECOMMENDATION = 'SOMEWHAT_RELEVANT_PRODUCT_RECOMMENDATION',
    NO_PRODUCT_RECOMMENDATION = 'NO_PRODUCT_RECOMMENDATION',
    OTHER = 'OTHER',
}

export enum AiAgentBinaryFeedbackEnum {
    UP = 'UP',
    DOWN = 'DOWN',
}

export const suggestedResourceValueSchema = z.object({
    resourceId: z.string(),
    resourceType: z.nativeEnum(AiAgentKnowledgeResourceTypeEnum),
    resourceSetId: z.string().optional().nullable(),
    resourceLocale: z.string().optional().nullable(),
})

export type SuggestedResourceValue = z.infer<
    typeof suggestedResourceValueSchema
>

export type KnowledgeResourcePreview = {
    id: string
    knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum
    url: string
    title: string
    content: string
    helpCenterId?: string
    resourceVersionId?: number
}

export enum KnowledgePendingCloseType {
    Discard = 'discard',
    Article = 'article',
}

export enum OpportunityDismissReason {
    NOT_FOR_AI_AGENT = 'NOT_FOR_AI_AGENT',
    TOPIC_ALREADY_EXISTS = 'TOPIC_ALREADY_EXISTS',
    INCORRECT_SUGGESTION = 'INCORRECT_SUGGESTION',
    IRRELEVANT_OPPORTUNITY = 'IRRELEVANT_OPPORTUNITY',
    KNOWLEDGE_INTENTIONALLY_DIFFERENT = 'KNOWLEDGE_INTENTIONALLY_DIFFERENT',
    KNOWLEDGE_IS_SIMILAR = 'KNOWLEDGE_IS_SIMILAR',
    OTHER = 'OTHER',
}

export enum FeedbackObjectType {
    TICKET = 'TICKET',
    OPPORTUNITY = 'OPPORTUNITY',
}

export enum FeedbackTargetType {
    TICKET = 'TICKET',
    KNOWLEDGE_RESOURCE = 'KNOWLEDGE_RESOURCE',
    OPPORTUNITY = 'OPPORTUNITY',
}

export enum OpportunityFeedbackType {
    OPPORTUNITY_DISMISS_REASON = 'OPPORTUNITY_DISMISS_REASON',
    OPPORTUNITY_FREEFORM = 'OPPORTUNITY_FREEFORM',
}
