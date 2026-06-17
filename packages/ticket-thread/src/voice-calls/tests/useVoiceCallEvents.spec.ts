import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListVoiceCallEventsHandler,
    mockListVoiceCallEventsResponse,
    mockVoiceCallEvent,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '#tests/render.utils'
import { server } from '#tests/server'
import { useVoiceCallEvents } from '#voice-calls/hooks/useVoiceCallEvents'

const testEvent = mockVoiceCallEvent({ id: 1, call_id: 55 })

beforeEach(() => {
    server.use(
        mockListVoiceCallEventsHandler(async () =>
            HttpResponse.json(
                mockListVoiceCallEventsResponse({ data: [testEvent] }),
            ),
        ).handler,
    )
})

describe('useVoiceCallEvents', () => {
    it('returns events array after loading', async () => {
        const { result } = renderHook(() => useVoiceCallEvents(55))
        await waitFor(() => {
            expect(result.current.events).toBeDefined()
        })
        expect(result.current.events).toHaveLength(1)
    })

    it('isLoading is true before data resolves', () => {
        const { result } = renderHook(() => useVoiceCallEvents(55))
        expect(result.current.isLoading).toBe(true)
    })

    it('isError is false on success', async () => {
        const { result } = renderHook(() => useVoiceCallEvents(55))
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.isError).toBe(false)
    })
})
