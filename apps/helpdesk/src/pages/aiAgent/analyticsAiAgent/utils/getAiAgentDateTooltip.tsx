import type { ReactNode } from 'react'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { Text } from '@gorgias/axiom'
import {
    DATA_NOT_AVAILABLE_TOOLTIP_MESSAGE,
    DATA_NOT_YET_AVAILABLE_TOOLTIP_MESSAGE,
    DATA_PENDING_AUTOMATION_TOOLTIP_MESSAGE,
    MIN_DATE_FOR_AI_AGENT,
} from 'pages/aiAgent/analyticsAiAgent/constants'

export const getAiAgentDateTooltip = (
    date: DateValue,
): ReactNode | undefined => {
    const todayDate = today(getLocalTimeZone())

    if (
        MIN_DATE_FOR_AI_AGENT &&
        date.compare(parseDate(MIN_DATE_FOR_AI_AGENT)) < 0
    ) {
        return <Text size="sm">{DATA_NOT_AVAILABLE_TOOLTIP_MESSAGE}</Text>
    }

    if (date.compare(todayDate) > 0) {
        return <Text size="sm">{DATA_NOT_YET_AVAILABLE_TOOLTIP_MESSAGE}</Text>
    }

    if (date.compare(todayDate.subtract({ days: 2 })) >= 0) {
        return <Text size="sm">{DATA_PENDING_AUTOMATION_TOOLTIP_MESSAGE}</Text>
    }

    return undefined
}
