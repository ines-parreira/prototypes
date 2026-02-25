import { z } from 'zod'

export const ticketSatisfactionSurveySchema = z.object({
    score: z.number().nullable(),
    customer_id: z.number(),
    scored_datetime: z.string().nullable(),
    ticket_id: z.number(),
})
export type TicketSatisfactionSurveySchema = z.infer<
    typeof ticketSatisfactionSurveySchema
>
