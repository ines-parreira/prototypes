import { z } from 'zod'

export const ticketSatisfactionSurveyBaseSchema = z.object({
    created_datetime: z.string(),
    customer_id: z.number(),
    id: z.number(),
    ticket_id: z.number(),
})
export type TicketSatisfactionSurveyBaseSchema = z.infer<
    typeof ticketSatisfactionSurveyBaseSchema
>

export const respondedSatisfactionSurveySchema =
    ticketSatisfactionSurveyBaseSchema.extend({
        body_text: z.string().nullable(),
        score: z.number(),
        scored_datetime: z.string(),
        sent_datetime: z.string().nullable(),
        should_send_datetime: z.string().nullable(),
    })
export type RespondedSatisfactionSurveySchema = z.infer<
    typeof respondedSatisfactionSurveySchema
>

export const sentSatisfactionSurveySchema =
    ticketSatisfactionSurveyBaseSchema.extend({
        body_text: z.null(),
        score: z.null(),
        scored_datetime: z.null(),
        sent_datetime: z.string(),
        should_send_datetime: z.string().nullable(),
    })
export type SentSatisfactionSurveySchema = z.infer<
    typeof sentSatisfactionSurveySchema
>

export const scheduledSatisfactionSurveySchema =
    ticketSatisfactionSurveyBaseSchema.extend({
        body_text: z.null(),
        score: z.null(),
        scored_datetime: z.null(),
        sent_datetime: z.null(),
        should_send_datetime: z.string(),
    })
export type ScheduledSatisfactionSurveySchema = z.infer<
    typeof scheduledSatisfactionSurveySchema
>

export const toBeSentSatisfactionSurveySchema =
    ticketSatisfactionSurveyBaseSchema.extend({
        body_text: z.null(),
        score: z.null(),
        scored_datetime: z.null(),
        sent_datetime: z.null(),
        should_send_datetime: z.null(),
    })
export type ToBeSentSatisfactionSurveySchema = z.infer<
    typeof toBeSentSatisfactionSurveySchema
>

export const ticketSatisfactionSurveySchema = z.union([
    respondedSatisfactionSurveySchema,
    sentSatisfactionSurveySchema,
    scheduledSatisfactionSurveySchema,
    toBeSentSatisfactionSurveySchema,
])
export type TicketSatisfactionSurveySchema = z.infer<
    typeof ticketSatisfactionSurveySchema
>

const satisfactionSurveyAuthorLabelSchema = z.object({
    authorLabel: z.string(),
})

export const surveyBackedRespondedSatisfactionSurveyDataSchema =
    respondedSatisfactionSurveySchema.extend({
        authorLabel: z.string(),
        source: z.literal('survey'),
    })
export type SurveyBackedRespondedSatisfactionSurveyDataSchema = z.infer<
    typeof surveyBackedRespondedSatisfactionSurveyDataSchema
>

export const eventBackedRespondedSatisfactionSurveyDataSchema =
    satisfactionSurveyAuthorLabelSchema.extend({
        body_text: z.string().nullable(),
        score: z.number(),
        source: z.literal('event'),
    })
export type EventBackedRespondedSatisfactionSurveyDataSchema = z.infer<
    typeof eventBackedRespondedSatisfactionSurveyDataSchema
>

export const ticketThreadRespondedSatisfactionSurveyItemSchema = z.object({
    status: z.literal('responded'),
    data: z.union([
        surveyBackedRespondedSatisfactionSurveyDataSchema,
        eventBackedRespondedSatisfactionSurveyDataSchema,
    ]),
    datetime: z.string(),
})
export type TicketThreadRespondedSatisfactionSurveyItemSchema = z.infer<
    typeof ticketThreadRespondedSatisfactionSurveyItemSchema
>

export const ticketThreadSentSatisfactionSurveyItemSchema = z.object({
    status: z.literal('sent'),
    data: sentSatisfactionSurveySchema.extend({
        authorLabel: z.string(),
    }),
    datetime: z.string(),
})
export type TicketThreadSentSatisfactionSurveyItemSchema = z.infer<
    typeof ticketThreadSentSatisfactionSurveyItemSchema
>

export const ticketThreadScheduledSatisfactionSurveyItemSchema = z.object({
    status: z.literal('scheduled'),
    data: scheduledSatisfactionSurveySchema.extend({
        authorLabel: z.string(),
    }),
    datetime: z.string(),
})
export type TicketThreadScheduledSatisfactionSurveyItemSchema = z.infer<
    typeof ticketThreadScheduledSatisfactionSurveyItemSchema
>

export const ticketThreadToBeSentSatisfactionSurveyItemSchema = z.object({
    status: z.literal('to-be-sent'),
    data: toBeSentSatisfactionSurveySchema.extend({
        authorLabel: z.string(),
    }),
    datetime: z.string(),
})
export type TicketThreadToBeSentSatisfactionSurveyItemSchema = z.infer<
    typeof ticketThreadToBeSentSatisfactionSurveyItemSchema
>

export const ticketThreadSatisfactionSurveyItemSchema = z.discriminatedUnion(
    'status',
    [
        ticketThreadRespondedSatisfactionSurveyItemSchema,
        ticketThreadSentSatisfactionSurveyItemSchema,
        ticketThreadScheduledSatisfactionSurveyItemSchema,
        ticketThreadToBeSentSatisfactionSurveyItemSchema,
    ],
)
export type TicketThreadSatisfactionSurveyItemSchema = z.infer<
    typeof ticketThreadSatisfactionSurveyItemSchema
>
