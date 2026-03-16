import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadSatisfactionSurveyItemByStatus } from '../../hooks/satisfaction-survey/types'
import { TicketThreadEventContainer } from '../TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../TicketThreadEventItem/components/TicketThreadEventDateTime'

type TicketThreadSentSatisfactionSurveyProps = {
    item: TicketThreadSatisfactionSurveyItemByStatus<'sent'>
}

export function TicketThreadSentSatisfactionSurvey({
    item,
}: TicketThreadSentSatisfactionSurveyProps) {
    return (
        <TicketThreadEventContainer>
            <Icon name="star" size="sm" />
            <Text size="sm">
                CSAT review was sent to {item.data.authorLabel}
            </Text>
            {item.data.sent_datetime && (
                <TicketThreadEventDateTime datetime={item.data.sent_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
