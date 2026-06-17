import { Duration } from '@gorgias/toolkit'
import { useExhaustEndpoint } from '@gorgias/toolkit-react'

import { listEvents, ListEventsObjectType } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE } from '#satisfaction-surveys/constants'

export function useListAllSatisfactionSurveyEvents(
    satisfactionSurveyId: number | null | undefined,
) {
    const objectId = satisfactionSurveyId ?? undefined

    return useExhaustEndpoint(
        queryKeys.events.listEvents({
            object_id: objectId,
            object_type: ListEventsObjectType.SatisfactionSurvey,
            types: [SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE],
        }),
        (cursor) =>
            listEvents({
                cursor,
                object_id: objectId,
                object_type: ListEventsObjectType.SatisfactionSurvey,
                types: [SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE],
                limit: 100,
            }),
        {
            enabled: !!objectId,
            staleTime: Duration.days(1),
            refetchOnWindowFocus: false,
        },
    )
}
