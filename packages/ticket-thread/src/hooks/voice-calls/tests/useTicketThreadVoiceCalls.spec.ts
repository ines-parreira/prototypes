import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListVoiceCallsHandler,
    mockListVoiceCallsResponse,
    mockVoiceCall,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { TicketThreadItemTag } from '../../types'
import { useTicketThreadVoiceCalls } from '../useTicketThreadVoiceCalls'

describe('useTicketThreadVoiceCalls', () => {
    it('maps outbound and regular voice calls to dedicated tags', async () => {
        const mockListVoiceCalls = mockListVoiceCallsHandler(async () =>
            HttpResponse.json(
                mockListVoiceCallsResponse({
                    data: [
                        mockVoiceCall({
                            id: 11,
                            direction: 'inbound',
                            initiated_by_agent_id: undefined,
                            created_datetime: '2024-03-21T11:00:00Z',
                        }),
                        mockVoiceCall({
                            id: 12,
                            direction: 'outbound',
                            initiated_by_agent_id: 77,
                            created_datetime: '2024-03-21T11:10:00Z',
                        }),
                    ],
                    meta: { prev_cursor: null, next_cursor: null },
                }),
            ),
        )

        server.use(mockListVoiceCalls.handler)

        const { result } = renderHook(() =>
            useTicketThreadVoiceCalls({ ticketId: 7 }),
        )

        await waitFor(() => {
            expect(result.current.map((item) => item._tag)).toEqual([
                TicketThreadItemTag.VoiceCalls.VoiceCall,
                TicketThreadItemTag.VoiceCalls.OutboundVoiceCall,
            ])
        })
    })

    it('returns an empty list when the API has no voice calls', async () => {
        const mockListVoiceCalls = mockListVoiceCallsHandler(async () =>
            HttpResponse.json(
                mockListVoiceCallsResponse({
                    data: [],
                    meta: { prev_cursor: null, next_cursor: null },
                }),
            ),
        )

        server.use(mockListVoiceCalls.handler)

        const { result } = renderHook(() =>
            useTicketThreadVoiceCalls({ ticketId: 99 }),
        )

        await waitFor(() => {
            expect(result.current).toEqual([])
        })
    })
})
