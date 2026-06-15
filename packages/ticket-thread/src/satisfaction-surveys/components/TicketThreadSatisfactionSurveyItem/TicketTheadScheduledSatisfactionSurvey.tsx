import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadEventContainer } from '../../../events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../../events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadSatisfactionSurveyItemByStatus } from '../../types'

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
