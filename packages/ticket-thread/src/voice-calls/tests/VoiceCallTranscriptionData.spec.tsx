import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { vi } from 'vitest'

import {
    mockGetVoiceCallRecordingTranscriptionHandler,
    mockGetVoiceCallRecordingTranscriptionResponse,
} from '@gorgias/helpdesk-mocks'

import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { VoiceCallTranscriptionData } from '#voice-calls/components/TicketThreadCallItem/components/VoiceCallTranscriptionData'
import { VoiceCallRecordingType } from '#voice-calls/models/types'

beforeAll(() => {
    class MockIntersectionObserver {
        observe = vi.fn()
        disconnect = vi.fn()
        unobserve = vi.fn()
    }

    class MockResizeObserver {
        observe = vi.fn()
        disconnect = vi.fn()
        unobserve = vi.fn()
    }

    window.IntersectionObserver =
        MockIntersectionObserver as unknown as typeof IntersectionObserver
    window.ResizeObserver =
        MockResizeObserver as unknown as typeof ResizeObserver
})

describe('VoiceCallTranscriptionData', () => {
    describe('loading state', () => {
        beforeEach(() => {
            server.use(
                mockGetVoiceCallRecordingTranscriptionHandler(
                    () => new Promise(() => {}),
                ).handler,
            )
        })

        it('shows loading state while request is pending', () => {
            render(
                <VoiceCallTranscriptionData
                    recordingId={1}
                    recordingType={VoiceCallRecordingType.Recording}
                    enabled={true}
                />,
            )

            expect(
                screen.getByText(/loading the call transcription/i),
            ).toBeInTheDocument()
        })

        it('shows voicemail loading text for voicemail type while pending', () => {
            render(
                <VoiceCallTranscriptionData
                    recordingId={1}
                    recordingType={VoiceCallRecordingType.Voicemail}
                    enabled={true}
                />,
            )

            expect(
                screen.getByText(/loading the voicemail transcription/i),
            ).toBeInTheDocument()
        })

        it('does not fetch when enabled is false', () => {
            render(
                <VoiceCallTranscriptionData
                    recordingId={1}
                    recordingType={VoiceCallRecordingType.Recording}
                    enabled={false}
                />,
            )

            expect(
                screen.queryByText(/loading the call transcription/i),
            ).not.toBeInTheDocument()
        })
    })

    describe('success state', () => {
        beforeEach(() => {
            server.use(
                mockGetVoiceCallRecordingTranscriptionHandler(async () =>
                    HttpResponse.json(
                        mockGetVoiceCallRecordingTranscriptionResponse({
                            transcription: [
                                {
                                    channel: 0,
                                    speaker: 0,
                                    start: 0,
                                    end: 5,
                                    transcript: 'Hello, how can I help you?',
                                },
                            ],
                            speakers: [],
                            error_message: null,
                        }),
                    ),
                ).handler,
            )
        })

        it('renders transcript text when data loads', async () => {
            render(
                <VoiceCallTranscriptionData
                    recordingId={1}
                    recordingType={VoiceCallRecordingType.Recording}
                    enabled={true}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Hello, how can I help you?'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('error state', () => {
        beforeEach(() => {
            server.use(
                mockGetVoiceCallRecordingTranscriptionHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )
        })

        it('shows error state when fetch fails', async () => {
            render(
                <VoiceCallTranscriptionData
                    recordingId={1}
                    recordingType={VoiceCallRecordingType.Recording}
                    enabled={true}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByText(/unable to load call transcription/i),
                ).toBeInTheDocument()
            })
        })

        it('renders retry button when fetch fails', async () => {
            render(
                <VoiceCallTranscriptionData
                    recordingId={1}
                    recordingType={VoiceCallRecordingType.Recording}
                    enabled={true}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /try again/i }),
                ).toBeInTheDocument()
            })
        })
    })
})
