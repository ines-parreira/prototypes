import type { TicketThreadItemTag } from '../types'
import type {
    EventBackedRespondedSatisfactionSurveyDataSchema,
    RespondedSatisfactionSurveySchema,
    ScheduledSatisfactionSurveySchema,
    SentSatisfactionSurveySchema,
    SurveyBackedRespondedSatisfactionSurveyDataSchema,
    TicketSatisfactionSurveySchema,
    TicketThreadSatisfactionSurveyItemSchema,
    TicketThreadScheduledSatisfactionSurveyItemSchema,
    TicketThreadSentSatisfactionSurveyItemSchema,
    TicketThreadToBeSentSatisfactionSurveyItemSchema,
    ToBeSentSatisfactionSurveySchema,
} from './schemas'

type TaggedSatisfactionSurveyItem<TSurveyItem> = {
    _tag: typeof TicketThreadItemTag.SatisfactionSurvey
} & TSurveyItem

type TaggedRespondedSatisfactionSurveyItem<TData> =
    TaggedSatisfactionSurveyItem<{
        status: 'responded'
        data: TData
        datetime: string
    }>

export type SurveyBackedRespondedSatisfactionSurveyData =
    SurveyBackedRespondedSatisfactionSurveyDataSchema

export type EventBackedRespondedSatisfactionSurveyData =
    EventBackedRespondedSatisfactionSurveyDataSchema

export type TicketThreadRespondedSatisfactionSurveyData =
    | SurveyBackedRespondedSatisfactionSurveyData
    | EventBackedRespondedSatisfactionSurveyData

export type SurveyBackedRespondedSatisfactionSurveyItem =
    TaggedRespondedSatisfactionSurveyItem<SurveyBackedRespondedSatisfactionSurveyData>

export type EventBackedRespondedSatisfactionSurveyItem =
    TaggedRespondedSatisfactionSurveyItem<EventBackedRespondedSatisfactionSurveyData>

export type TicketThreadRespondedSatisfactionSurveyItem =
    | SurveyBackedRespondedSatisfactionSurveyItem
    | EventBackedRespondedSatisfactionSurveyItem

export type TicketThreadSentSatisfactionSurveyItem =
    TaggedSatisfactionSurveyItem<TicketThreadSentSatisfactionSurveyItemSchema>

export type TicketThreadScheduledSatisfactionSurveyItem =
    TaggedSatisfactionSurveyItem<TicketThreadScheduledSatisfactionSurveyItemSchema>

export type TicketThreadToBeSentSatisfactionSurveyItem =
    TaggedSatisfactionSurveyItem<TicketThreadToBeSentSatisfactionSurveyItemSchema>

export type TicketThreadSatisfactionSurveyItem =
    TaggedSatisfactionSurveyItem<TicketThreadSatisfactionSurveyItemSchema>

export type {
    RespondedSatisfactionSurveySchema,
    ScheduledSatisfactionSurveySchema,
    SentSatisfactionSurveySchema,
    SurveyBackedRespondedSatisfactionSurveyDataSchema,
    EventBackedRespondedSatisfactionSurveyDataSchema,
    TicketSatisfactionSurveySchema,
    ToBeSentSatisfactionSurveySchema,
}

export type TicketThreadSatisfactionSurveyStatus =
    TicketThreadSatisfactionSurveyItem['status']
export type TicketThreadSatisfactionSurveyItemByStatus<
    TStatus extends TicketThreadSatisfactionSurveyStatus,
> = Extract<TicketThreadSatisfactionSurveyItem, { status: TStatus }>
