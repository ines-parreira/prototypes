import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { ListEventsObjectType } from '@gorgias/helpdesk-client'
import {
    mockEvent,
    mockListEventsHandler,
    mockListEventsResponse,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE } from '../constants'
import { useListAllSatisfactionSurveyEvents } from '../useListAllSatisfactionSurveyEvents'

describe('useListAllSatisfactionSurveyEvents', () => {
    it('fetches responded survey events with expected request parameters', async () => {
        const event = mockEvent({
            id: 901,
            object_id: 456,
            object_type: ListEventsObjectType.SatisfactionSurvey,
            type: SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE,
            data: {
                score: 5,
                body_text: 'Great support',
            },
            created_datetime: '2024-03-21T11:00:00Z',
        })
        const mockListEvents = mockListEventsHandler(async () =>
            HttpResponse.json(
                mockListEventsResponse({
                    data: [event],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                    },
                }),
            ),
        )
        const waitForListEventsRequest = mockListEvents.waitForRequest(server)

        server.use(mockListEvents.handler)

        const { result } = renderHook(() =>
            useListAllSatisfactionSurveyEvents(456),
        )

        await waitForListEventsRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('object_id')).toBe('456')
            expect(url.searchParams.get('object_type')).toBe(
                ListEventsObjectType.SatisfactionSurvey,
            )
            expect(url.searchParams.get('types')).toBe(
                SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE,
            )
            expect(url.searchParams.get('limit')).toBe('100')
        })

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })
        expect(result.current.data[0]?.id).toBe(901)
    })
})
