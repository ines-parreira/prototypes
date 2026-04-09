import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListVoiceCallRecordingsHandler,
    mockListVoiceCallRecordingsResponse,
    mockVoiceCallRecording,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { useVoiceCallRecordings } from '../hooks/useVoiceCallRecordings'

const testRecording = mockVoiceCallRecording({ id: 1, call_id: 55 })

beforeEach(() => {
    server.use(
        mockListVoiceCallRecordingsHandler(async () =>
            HttpResponse.json(
                mockListVoiceCallRecordingsResponse({ data: [testRecording] }),
            ),
        ).handler,
    )
})

describe('useVoiceCallRecordings', () => {
    it('returns recordings array after loading', async () => {
        const { result } = renderHook(() => useVoiceCallRecordings(55))
        await waitFor(() => {
            expect(result.current.recordings).toBeDefined()
        })
        expect(result.current.recordings).toHaveLength(1)
    })

    it('isLoading is true before data resolves', () => {
        const { result } = renderHook(() => useVoiceCallRecordings(55))
        expect(result.current.isLoading).toBe(true)
    })

    it('isError is false on success', async () => {
        const { result } = renderHook(() => useVoiceCallRecordings(55))
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
        expect(result.current.isError).toBe(false)
    })
})
