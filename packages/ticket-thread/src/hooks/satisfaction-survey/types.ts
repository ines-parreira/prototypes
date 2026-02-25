import type { TicketSatisfactionSurvey } from '@gorgias/helpdesk-queries'

import type { TicketThreadItemTag } from '../types'

export type TicketThreadSatisfactionSurveyItem = {
    _tag: typeof TicketThreadItemTag.SatisfactionSurvey
    data: TicketSatisfactionSurvey
    datetime: string
}
