import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadSatisfactionSurveyItemByStatus } from '../../hooks/satisfaction-survey/types'
import { TicketThreadEventContainer } from '../TicketThreadEventItem/components/TicketThreadEventContainer'

type TicketThreadToBeSentSatisfactionSurveyProps = {
    item: TicketThreadSatisfactionSurveyItemByStatus<'to-be-sent'>
}

export function TicketThreadToBeSentSatisfactionSurvey({
    item,
}: TicketThreadToBeSentSatisfactionSurveyProps) {
    return (
        <TicketThreadEventContainer>
            <Icon name="star" size="sm" />
            <Text size="sm">
                CSAT review to be sent to {item.data.authorLabel}
            </Text>
        </TicketThreadEventContainer>
    )
}
