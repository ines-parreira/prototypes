import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadSatisfactionSurveyItemByStatus } from '../../hooks/satisfaction-survey/types'
import { TicketThreadEventContainer } from '../TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../TicketThreadEventItem/components/TicketThreadEventDateTime'

type TicketThreadScheduledSatisfactionSurveyProps = {
    item: TicketThreadSatisfactionSurveyItemByStatus<'scheduled'>
}

export function TicketThreadScheduledSatisfactionSurvey({
    item,
}: TicketThreadScheduledSatisfactionSurveyProps) {
    return (
        <TicketThreadEventContainer>
            <Icon name="star" size="sm" />
            <Text size="sm">
                CSAT review will be sent to {item.data.authorLabel}
            </Text>
            {item.data.should_send_datetime && (
                <TicketThreadEventDateTime
                    datetime={item.data.should_send_datetime}
                />
            )}
        </TicketThreadEventContainer>
    )
}
