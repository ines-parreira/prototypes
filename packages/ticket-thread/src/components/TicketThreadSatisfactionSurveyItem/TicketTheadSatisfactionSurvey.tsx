import { Box } from '@gorgias/axiom'

import type { TicketThreadSatisfactionSurveyItem } from '../../hooks/satisfaction-survey/types'

type TicketThreadSatisfactionSurveyProps = {
    item: TicketThreadSatisfactionSurveyItem
}

export function TicketThreadSatisfactionSurvey({
    item,
}: TicketThreadSatisfactionSurveyProps) {
    return (
        <Box padding="md" alignSelf="flex-end">
            {JSON.stringify(item.data)}
        </Box>
    )
}
