import { useMemo } from 'react'

import { isSatisfactionSurveyRespondedEvent } from '../events/predicates'
import { useListAllSatisfactionSurveyEvents } from './useListAllSatisfactionSurveyEvents'

export function useGetSatisfactionSurveyRespondedEvent(
    satisfactionSurveyId: number | null,
) {
    const { data: satisfactionSurveyEvents } =
        useListAllSatisfactionSurveyEvents(satisfactionSurveyId)

    return useMemo(() => {
        const respondedEvents = (satisfactionSurveyEvents ?? [])
            .filter(isSatisfactionSurveyRespondedEvent)
            .sort((left, right) =>
                (left.created_datetime ?? '').localeCompare(
                    right.created_datetime ?? '',
                ),
            )

        return respondedEvents.at(-1) ?? null
    }, [satisfactionSurveyEvents])
}
