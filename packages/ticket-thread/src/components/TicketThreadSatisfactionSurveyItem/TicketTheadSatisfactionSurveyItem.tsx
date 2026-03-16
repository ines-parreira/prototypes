import type { TicketThreadSatisfactionSurveyItem } from '../../hooks/satisfaction-survey/types'
import { assertNever } from '../../utils/assertNever'
import { TicketThreadRespondedSatisfactionSurvey } from './TicketTheadRespondedSatisfactionSurvey'
import { TicketThreadScheduledSatisfactionSurvey } from './TicketTheadScheduledSatisfactionSurvey'
import { TicketThreadSentSatisfactionSurvey } from './TicketTheadSentSatisfactionSurvey'
import { TicketThreadToBeSentSatisfactionSurvey } from './TicketTheadToBeSentSatisfactionSurvey'

type TicketThreadSatisfactionSurveyItemProps = {
    item: TicketThreadSatisfactionSurveyItem
}
export function TicketThreadSatisfactionSurveyItem({
    item,
}: TicketThreadSatisfactionSurveyItemProps) {
    switch (item.status) {
        case 'responded':
            return <TicketThreadRespondedSatisfactionSurvey item={item} />
        case 'sent':
            return <TicketThreadSentSatisfactionSurvey item={item} />
        case 'scheduled':
            return <TicketThreadScheduledSatisfactionSurvey item={item} />
        case 'to-be-sent':
            return <TicketThreadToBeSentSatisfactionSurvey item={item} />
        default:
            return assertNever(item)
    }
}
