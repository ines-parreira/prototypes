import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadEventContainer } from '../../../events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../../events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadSatisfactionSurveyItemByStatus } from '../../types'

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
