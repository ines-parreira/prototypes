import { useExhaustEndpoint } from '@repo/hooks'
import { DurationInMs } from '@repo/utils'

import { listEvents, ListEventsObjectType } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE } from './constants'

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
            staleTime: DurationInMs.OneDay,
            refetchOnWindowFocus: false,
        },
    )
}
