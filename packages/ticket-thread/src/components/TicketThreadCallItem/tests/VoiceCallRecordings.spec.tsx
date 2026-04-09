import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { vi } from 'vitest'

import {
    mockListVoiceCallRecordingsHandler,
    mockListVoiceCallRecordingsResponse,
    mockVoiceCallRecording,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import {
    VoiceCallRecordings,
    VoiceCallTranscriptions,
} from '../components/VoiceCallRecordings'
import { VoiceCallRecordingType } from '../models/types'

beforeAll(() => {
    window.HTMLMediaElement.prototype.play = vi
        .fn()
        .mockResolvedValue(undefined)
    window.HTMLMediaElement.prototype.pause = vi.fn()
    window.GORGIAS_STATE = {
        currentAccount: { domain: 'test' },
    } as typeof window.GORGIAS_STATE
})

afterAll(() => {
    delete (window as any).GORGIAS_STATE
})

describe('VoiceCallRecordings', () => {
    it('does not show error message while loading is pending', () => {
        server.use(
            mockListVoiceCallRecordingsHandler(() => new Promise(() => {}))
                .handler,
        )

        render(
            <VoiceCallRecordings
                callId={55}
                type={VoiceCallRecordingType.Recording}
            />,
        )

        expect(
            screen.queryByText(/Recording is not available/i),
        ).not.toBeInTheDocument()
    })

    it('shows "Recording is not available" when no recordings match the type', async () => {
        const voicemailRecording = mockVoiceCallRecording({
            id: 1,
            call_id: 55,
            type: 'voicemail',
        })

        server.use(
            mockListVoiceCallRecordingsHandler(async () =>
                HttpResponse.json(
                    mockListVoiceCallRecordingsResponse({
                        data: [voicemailRecording],
                    }),
                ),
            ).handler,
        )

        render(
            <VoiceCallRecordings
                callId={55}
                type={VoiceCallRecordingType.Recording}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByText(/Recording is not available/i),
            ).toBeInTheDocument()
        })
    })

    it('shows "Recording is not available" when the list is empty', async () => {
        server.use(
            mockListVoiceCallRecordingsHandler(async () =>
                HttpResponse.json(
                    mockListVoiceCallRecordingsResponse({ data: [] }),
                ),
            ).handler,
        )

        render(
            <VoiceCallRecordings
                callId={55}
                type={VoiceCallRecordingType.Recording}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByText(/Recording is not available/i),
            ).toBeInTheDocument()
        })
    })

    it('renders a play button for each matching recording', async () => {
        const recording1 = mockVoiceCallRecording({
            id: 1,
            call_id: 55,
            type: 'call-recording',
            url: 'https://example.com/audio1.mp3',
            deleted_datetime: undefined,
            error_code: null,
        })
        const recording2 = mockVoiceCallRecording({
            id: 2,
            call_id: 55,
            type: 'call-recording',
            url: 'https://example.com/audio2.mp3',
            deleted_datetime: undefined,
            error_code: null,
        })

        server.use(
            mockListVoiceCallRecordingsHandler(async () =>
                HttpResponse.json(
                    mockListVoiceCallRecordingsResponse({
                        data: [recording1, recording2],
                    }),
                ),
            ).handler,
        )

        render(
            <VoiceCallRecordings
                callId={55}
                type={VoiceCallRecordingType.Recording}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getAllByRole('button', { name: /play/i }),
            ).toHaveLength(2)
        })
    })
})

describe('VoiceCallTranscriptions', () => {
    it('renders nothing when no recordings exist', async () => {
        server.use(
            mockListVoiceCallRecordingsHandler(async () =>
                HttpResponse.json(
                    mockListVoiceCallRecordingsResponse({ data: [] }),
                ),
            ).handler,
        )

        const { container } = render(
            <VoiceCallTranscriptions
                callId={55}
                type={VoiceCallRecordingType.Recording}
            />,
        )

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })
})
