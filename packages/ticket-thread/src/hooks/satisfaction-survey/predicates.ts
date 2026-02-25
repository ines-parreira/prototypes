import type { TicketSatisfactionSurvey } from '@gorgias/helpdesk-queries'

import { ticketSatisfactionSurveySchema } from './schemas'

export function isTicketSatisfactionSurvey(
    input: unknown,
): input is TicketSatisfactionSurvey {
    return ticketSatisfactionSurveySchema.safeParse(input).success
}
