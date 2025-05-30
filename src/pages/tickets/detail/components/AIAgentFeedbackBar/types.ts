import { z } from 'zod'

import { Components } from 'rest_api/knowledge_service_api/client.generated'

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
}

export type KnowledgeResource = {
    executionId: Components.Schemas.FeedbackDto['executions'][0]['executionId']
    resource: Components.Schemas.FeedbackDto['executions'][0]['resources'][0]
    feedback?:
        | Components.Schemas.FeedbackDto['executions'][0]['feedback'][0]
        | Components.Schemas.FeedbackDto['executions'][0]['resources'][0]['feedback']
        | null
    metadata: ResourceMetadata
}

export type SuggestedResource = {
    executionId: Components.Schemas.FeedbackDto['executions'][0]['executionId']
    feedback: Components.Schemas.FeedbackDto['executions'][0]['feedback'][0]
    parsedResource: SuggestedResourceValue
    metadata: ResourceMetadata
}

export type FreeForm = {
    executionId: Components.Schemas.FeedbackDto['executions'][0]['executionId']
    feedback: Components.Schemas.FeedbackDto['executions'][0]['feedback'][0]
}

export type AiAgentKnowledgeResourceType =
    Components.Schemas.FeedbackDto['executions'][0]['resources'][0]['resourceType']

export enum AiAgentKnowledgeResourceTypeEnum {
    GUIDANCE = 'GUIDANCE',
    ACTION = 'ACTION',
    ARTICLE = 'ARTICLE',
    MACRO = 'MACRO',
    EXTERNAL_SNIPPET = 'EXTERNAL_SNIPPET',
    FILE_EXTERNAL_SNIPPET = 'FILE_EXTERNAL_SNIPPET',
    ORDER = 'ORDER',
}

export enum AiAgentFeedbackTypeEnum {
    TICKET_FREEFORM = 'TICKET_FREEFORM',
    KNOWLEDGE_RESOURCE_BINARY = 'KNOWLEDGE_RESOURCE_BINARY',
    SUGGESTED_RESOURCE = 'SUGGESTED_RESOURCE',
}

export enum AiAgentBinaryFeedbackEnum {
    UP = 'UP',
    DOWN = 'DOWN',
}

export const suggestedResourceValueSchema = z.object({
    resourceId: z.string(),
    resourceType: z.nativeEnum(AiAgentKnowledgeResourceTypeEnum),
    resourceSetId: z.string().optional(),
    resourceLocale: z.string().optional(),
})

export type SuggestedResourceValue = z.infer<
    typeof suggestedResourceValueSchema
>
