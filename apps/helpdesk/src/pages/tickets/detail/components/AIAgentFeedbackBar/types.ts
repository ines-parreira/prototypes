import { z } from 'zod'

import {
    FeedbackExecutionsItem,
    FeedbackExecutionsItemFeedbackItem,
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
}

export type FeedbackDto = FindFeedbackResult['data']

export type KnowledgeResource = {
    executionId: FeedbackExecutionsItem['executionId']
    resource: FeedbackExecutionsItemResourcesItem
    feedback?:
        | FeedbackExecutionsItemFeedbackItem
        | FeedbackExecutionsItemResourcesItem['feedback']
        | null
    metadata: ResourceMetadata
}

export type SuggestedResource = {
    executionId: FeedbackExecutionsItem['executionId']
    feedback: FeedbackExecutionsItemFeedbackItem
    parsedResource: SuggestedResourceValue
    metadata: ResourceMetadata
}

export type FreeForm = {
    executionId: FeedbackExecutionsItem['executionId']
    feedback: FeedbackExecutionsItemFeedbackItem
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
    KNOWLEDGE_RESOURCE_BINARY = 'KNOWLEDGE_RESOURCE_BINARY',
    SUGGESTED_RESOURCE = 'SUGGESTED_RESOURCE',
}

export enum FeedbackRating {
    GOOD = 'GOOD',
    OK = 'OK',
    BAD = 'BAD',
}

export enum AiAgentBadInteractionReason {
    WRONG_KNOWLEDGE = 'WRONG_KNOWLEDGE',
    IGNORED_KNOWLEDGE = 'IGNORED_KNOWLEDGE',
    HALLUCINATION = 'HALLUCINATION',
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
    DIDNT_PROCESS_ATTACHMENT_CORRECTLY = 'DIDNT_PROCESS_ATTACHMENT_CORRECTLY',
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
}

export enum KnowledgePendingCloseType {
    Discard = 'discard',
    Article = 'article',
}
