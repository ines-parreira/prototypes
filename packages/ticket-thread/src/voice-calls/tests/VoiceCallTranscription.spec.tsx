import { screen } from '@testing-library/react'
import { vi } from 'vitest'

import {
    mockGetVoiceCallRecordingTranscriptionHandler,
    mockVoiceCallRecording,
} from '@gorgias/helpdesk-mocks'
import type { VoiceCallRecording } from '@gorgias/helpdesk-types'

import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { VoiceCallTranscription } from '#voice-calls/components/TicketThreadCallItem/components/VoiceCallTranscription'
import {
    VoiceCallRecordingErrorCode,
    VoiceCallRecordingTranscriptionStatus,
    VoiceCallRecordingType,
} from '#voice-calls/models/types'

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

const baseAudio = mockVoiceCallRecording({
    id: 1,
    call_id: 55,
    deleted_datetime: undefined,
    error_code: null,
}) as VoiceCallRecording

describe('VoiceCallTranscription', () => {
    it('returns null when deleted_datetime is set', () => {
        const { container } = render(
            <VoiceCallTranscription
                audio={{
                    ...baseAudio,
                    deleted_datetime: '2024-01-01T00:00:00Z',
                }}
                type={VoiceCallRecordingType.Recording}
            />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('returns null when error_code is set', () => {
        const { container } = render(
            <VoiceCallTranscription
                audio={{
                    ...baseAudio,
                    error_code:
                        VoiceCallRecordingErrorCode.RECORDING_IS_PRIVATE,
                }}
                type={VoiceCallRecordingType.Recording}
            />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    describe('when transcription is Completed', () => {
        beforeEach(() => {
            server.use(
                mockGetVoiceCallRecordingTranscriptionHandler(
                    () => new Promise(() => {}),
                ).handler,
            )
        })

        it('renders "Call transcription" for Completed status', () => {
            render(
                <VoiceCallTranscription
                    audio={{
                        ...baseAudio,
                        transcription_status:
                            VoiceCallRecordingTranscriptionStatus.Completed,
                    }}
                    type={VoiceCallRecordingType.Recording}
                />,
            )
            expect(screen.getByText('Call transcription')).toBeInTheDocument()
        })

        it('does not fetch transcription data when the panel is collapsed', () => {
            render(
                <VoiceCallTranscription
                    audio={{
                        ...baseAudio,
                        transcription_status:
                            VoiceCallRecordingTranscriptionStatus.Completed,
                    }}
                    type={VoiceCallRecordingType.Recording}
                />,
            )

            expect(
                screen.queryByText(/loading the call transcription/i),
            ).not.toBeInTheDocument()
        })

        it('fetches transcription data when the panel is expanded', async () => {
            const { user } = render(
                <VoiceCallTranscription
                    audio={{
                        ...baseAudio,
                        transcription_status:
                            VoiceCallRecordingTranscriptionStatus.Completed,
                    }}
                    type={VoiceCallRecordingType.Recording}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /call transcription/i }),
            )

            expect(
                screen.getByText(/loading the call transcription/i),
            ).toBeInTheDocument()
        })
    })

    it('renders processing message mentioning "call" for Requested status with Recording type', () => {
        render(
            <VoiceCallTranscription
                audio={{
                    ...baseAudio,
                    transcription_status:
                        VoiceCallRecordingTranscriptionStatus.Requested,
                }}
                type={VoiceCallRecordingType.Recording}
            />,
        )
        expect(
            screen.getByText(
                /processing the audio to create an accurate transcription of the call/i,
            ),
        ).toBeInTheDocument()
    })

    it('renders processing message mentioning "voicemail" for Requested status with Voicemail type', () => {
        render(
            <VoiceCallTranscription
                audio={{
                    ...baseAudio,
                    transcription_status:
                        VoiceCallRecordingTranscriptionStatus.Requested,
                }}
                type={VoiceCallRecordingType.Voicemail}
            />,
        )
        expect(
            screen.getByText(
                /processing the audio to create an accurate transcription of the voicemail/i,
            ),
        ).toBeInTheDocument()
    })

    it('renders error message for LowQualityTranscription status', () => {
        render(
            <VoiceCallTranscription
                audio={{
                    ...baseAudio,
                    transcription_status:
                        VoiceCallRecordingTranscriptionStatus.LowQualityTranscription,
                }}
                type={VoiceCallRecordingType.Recording}
            />,
        )
        expect(
            screen.getByText(/audio quality of this call was too poor/i),
        ).toBeInTheDocument()
    })

    it('renders failure message for Failed status', () => {
        render(
            <VoiceCallTranscription
                audio={{
                    ...baseAudio,
                    transcription_status:
                        VoiceCallRecordingTranscriptionStatus.Failed,
                }}
                type={VoiceCallRecordingType.Recording}
            />,
        )
        expect(
            screen.getByText(/unable to process call transcription/i),
        ).toBeInTheDocument()
    })

    it('renders warning about max length for RecordingTooLong status', () => {
        render(
            <VoiceCallTranscription
                audio={{
                    ...baseAudio,
                    transcription_status:
                        VoiceCallRecordingTranscriptionStatus.RecordingTooLong,
                }}
                type={VoiceCallRecordingType.Recording}
            />,
        )
        expect(
            screen.getByText(/only support calls up to 45 minutes/i),
        ).toBeInTheDocument()
    })

    it('renders warning about short recording for RecordingTooShort status with Recording type', () => {
        render(
            <VoiceCallTranscription
                audio={{
                    ...baseAudio,
                    transcription_status:
                        VoiceCallRecordingTranscriptionStatus.RecordingTooShort,
                }}
                type={VoiceCallRecordingType.Recording}
            />,
        )
        expect(
            screen.getByText(/do not support calls shorter than 20 seconds/i),
        ).toBeInTheDocument()
    })

    it('renders warning with voicemail minimum length for RecordingTooShort with Voicemail type', () => {
        render(
            <VoiceCallTranscription
                audio={{
                    ...baseAudio,
                    transcription_status:
                        VoiceCallRecordingTranscriptionStatus.RecordingTooShort,
                }}
                type={VoiceCallRecordingType.Voicemail}
            />,
        )
        expect(
            screen.getByText(
                /do not support voicemails shorter than 8 seconds/i,
            ),
        ).toBeInTheDocument()
    })

    it('returns null for undefined/unknown transcription status', () => {
        const { container } = render(
            <VoiceCallTranscription
                audio={{
                    ...baseAudio,
                    transcription_status: undefined,
                }}
                type={VoiceCallRecordingType.Recording}
            />,
        )
        expect(container).toBeEmptyDOMElement()
    })
})
