import { useMemo } from 'react'

import { isSatisfactionSurveyRespondedEvent } from '#events/predicates'
import { useListAllSatisfactionSurveyEvents } from './useListAllSatisfactionSurveyEvents'

export function useListSatisfactionSurveyRespondedEvents(
    satisfactionSurveyId: number | null,
) {
    const { data: satisfactionSurveyEvents = [] } =
        useListAllSatisfactionSurveyEvents(satisfactionSurveyId)

    return useMemo(
        () =>
            satisfactionSurveyEvents
                .filter(isSatisfactionSurveyRespondedEvent)
                .sort((left, right) =>
                    left.created_datetime.localeCompare(right.created_datetime),
                ),
        [satisfactionSurveyEvents],
    )
}
