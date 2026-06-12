import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockGetVoiceCallRecordingTranscriptionHandler,
    mockGetVoiceCallRecordingTranscriptionResponse,
} from '@gorgias/helpdesk-mocks'
import type { VoiceCallRecordingTranscription } from '@gorgias/helpdesk-types'

import { VoiceCallRecordingType } from 'models/voiceCall/types'

import { TranscriptionData } from '../TranscriptionData'

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () => ({
        VoiceCallAgentLabel: ({ agentId }: { agentId: number }) => (
            <div>VoiceCallAgentLabel {agentId}</div>
        ),
    }),
)
jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () => ({
        VoiceCallCustomerLabel: ({ customerId }: { customerId: number }) => (
            <div>VoiceCallCustomerLabel {customerId}</div>
        ),
    }),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('TranscriptionData', () => {
    const voicemailTranscription = {
        transcription_status: 'completed',
        transcription: [
            {
                channel: 0,
                speaker: 0,
                start: 1.1999999,
                end: 30.585938,
                transcript:
                    'Hello. I am recording this call to make sure that we have reference for it in the future in the future. Goodbye. Have a nice day.',
            },
        ],
        speakers: [
            {
                channel: 0,
                speaker: 0,
                index_in_recording: 0,
                agent_id: null,
                customer_id: null,
            },
        ],
    } satisfies Partial<VoiceCallRecordingTranscription>
    const callRecordingTranscription = {
        transcription_status: 'completed',
        transcription: [
            {
                channel: 0,
                speaker: 0,
                start: 1.1999999,
                end: 5,
                transcript: 'Hello.',
            },
            {
                channel: 0,
                speaker: 1,
                start: 5.23,
                end: 7.12,
                transcript: 'Hi.',
            },
            {
                channel: 0,
                speaker: 0,
                start: 7.33,
                end: 12.585938,
                transcript: 'How can I help you?',
            },
            {
                channel: 0,
                speaker: 1,
                start: 13.1999999,
                end: 20.585938,
                transcript: 'Is this the business for business?',
            },
            {
                channel: 0,
                speaker: 0,
                start: 20.98,
                end: 25.44,
                transcript: 'Yup!',
            },
            {
                channel: 0,
                speaker: 1,
                start: 26.11,
                end: 30.585938,
                transcript: 'Alright, just checking.',
            },
            {
                channel: 0,
                speaker: 0,
                start: 31.22,
                end: 35.1,
                transcript: 'Have a nice day.',
            },
            {
                channel: 0,
                speaker: 1,
                start: 31.22,
                end: 35.1,
                transcript: 'Thanks, you too.',
            },
        ],
        speakers: [
            {
                channel: 0,
                speaker: 0,
                index_in_recording: 0,
                agent_id: null,
                customer_id: null,
            },
            {
                channel: 0,
                speaker: 1,
                index_in_recording: 1,
                agent_id: null,
                customer_id: null,
            },
        ],
    } satisfies Partial<VoiceCallRecordingTranscription>

    const renderComponent = (recordingType: VoiceCallRecordingType) => {
        return render(
            <TranscriptionData recordingType={recordingType} recordingId={1} />,
        )
    }

    const mockTranscription = (
        transcription: Partial<VoiceCallRecordingTranscription>,
    ) => {
        server.use(
            mockGetVoiceCallRecordingTranscriptionHandler(async () =>
                HttpResponse.json(
                    mockGetVoiceCallRecordingTranscriptionResponse({
                        error_message: null,
                        ...transcription,
                    }),
                ),
            ).handler,
        )
    }

    it('should render voicemail correctly', async () => {
        mockTranscription(voicemailTranscription)

        const { findByText, getByText, queryByText } = renderComponent(
            VoiceCallRecordingType.Voicemail,
        )

        expect(await findByText('Speaker 1')).toBeInTheDocument()
        expect(getByText('00:01')).toBeInTheDocument()
        expect(
            getByText(voicemailTranscription.transcription[0].transcript),
        ).toBeInTheDocument()
        expect(queryByText('Show More')).not.toBeInTheDocument()
        expect(queryByText('Show Less')).not.toBeInTheDocument()
    })

    it('should render voicemail correctly with customer label', async () => {
        const transcription = {
            ...voicemailTranscription,
            speakers: [
                {
                    channel: 0,
                    speaker: 0,
                    index_in_recording: 0,
                    agent_id: null,
                    customer_id: 123,
                },
            ],
        }
        mockTranscription(transcription)

        const { findByText, getByText, queryByText } = renderComponent(
            VoiceCallRecordingType.Voicemail,
        )

        expect(
            await findByText('VoiceCallCustomerLabel 123'),
        ).toBeInTheDocument()
        expect(getByText('00:01')).toBeInTheDocument()
        expect(
            getByText(voicemailTranscription.transcription[0].transcript),
        ).toBeInTheDocument()
        expect(queryByText('Show More')).not.toBeInTheDocument()
        expect(queryByText('Show Less')).not.toBeInTheDocument()
    })

    it('should render loading voicemail correctly', () => {
        server.use(
            mockGetVoiceCallRecordingTranscriptionHandler(
                async () => new Promise(() => undefined),
            ).handler,
        )

        const { getByText } = renderComponent(VoiceCallRecordingType.Voicemail)
        expect(
            getByText(
                "We're currently loading the voicemail transcription. This may take a few moments.",
            ),
        ).toBeInTheDocument()
    })

    it('should render error voicemail correctly', async () => {
        let requestCount = 0
        server.use(
            mockGetVoiceCallRecordingTranscriptionHandler(async () => {
                requestCount += 1
                return HttpResponse.json({ error: { msg: 'Failed' } } as any, {
                    status: 500,
                })
            }).handler,
        )

        const { findByText, getByText } = renderComponent(
            VoiceCallRecordingType.Voicemail,
        )
        expect(
            await findByText('Unable to load voicemail transcription.'),
        ).toBeInTheDocument()
        expect(getByText('Try again')).toBeInTheDocument()
        fireEvent.click(getByText('Try again'))
        await waitFor(() => {
            expect(requestCount).toBeGreaterThan(1)
        })
    })

    it('should render permanent error voicemail correctly', async () => {
        mockTranscription({
            ...voicemailTranscription,
            error_message: 'Could not transcribe.',
        })

        const { findByText, queryByText } = renderComponent(
            VoiceCallRecordingType.Voicemail,
        )
        expect(
            await findByText('Unable to load voicemail transcription.'),
        ).toBeInTheDocument()
        expect(queryByText('Try again')).not.toBeInTheDocument()
    })

    it('should render call recording correctly', async () => {
        mockTranscription(callRecordingTranscription)

        const { findByText, getByText, getAllByText } = renderComponent(
            VoiceCallRecordingType.Recording,
        )

        await findByText('Hello.')
        expect(getAllByText('Speaker 1')).toHaveLength(4)
        expect(getAllByText('Speaker 2')).toHaveLength(3)
        expect(getByText('00:01')).toBeInTheDocument()
        callRecordingTranscription.transcription
            .slice(0, 7)
            .forEach((transcript) => {
                expect(getByText(transcript.transcript)).toBeInTheDocument()
            })
        expect(getByText('Show More')).toBeInTheDocument()

        fireEvent.click(getByText('Show More'))
        expect(getAllByText('Speaker 2')).toHaveLength(4)
        expect(getByText('Show Less')).toBeInTheDocument()
    })

    it('should render call recording correctly with speaker labels', async () => {
        const transcription = {
            ...callRecordingTranscription,
            speakers: [
                {
                    channel: 0,
                    speaker: 0,
                    index_in_recording: 0,
                    agent_id: 1,
                    customer_id: null,
                },
                {
                    channel: 0,
                    speaker: 1,
                    index_in_recording: 1,
                    agent_id: null,
                    customer_id: 123,
                },
            ],
        }
        mockTranscription(transcription)

        const { findByText, getByText, getAllByText } = renderComponent(
            VoiceCallRecordingType.Recording,
        )

        await findByText('Hello.')
        expect(getAllByText('VoiceCallAgentLabel 1')).toHaveLength(4)
        expect(getAllByText('VoiceCallCustomerLabel 123')).toHaveLength(3)
        expect(getByText('00:01')).toBeInTheDocument()
        callRecordingTranscription.transcription
            .slice(0, 7)
            .forEach((transcript) => {
                expect(getByText(transcript.transcript)).toBeInTheDocument()
            })
        expect(getByText('Show More')).toBeInTheDocument()
    })

    it('should render loading recording correctly', () => {
        server.use(
            mockGetVoiceCallRecordingTranscriptionHandler(
                async () => new Promise(() => undefined),
            ).handler,
        )

        const { getByText } = renderComponent(VoiceCallRecordingType.Recording)
        expect(
            getByText(
                "We're currently loading the call transcription. This may take a few moments.",
            ),
        ).toBeInTheDocument()
    })

    it('should render error recording correctly', async () => {
        let requestCount = 0
        server.use(
            mockGetVoiceCallRecordingTranscriptionHandler(async () => {
                requestCount += 1
                return HttpResponse.json({ error: { msg: 'Failed' } } as any, {
                    status: 500,
                })
            }).handler,
        )

        const { findByText, getByText } = renderComponent(
            VoiceCallRecordingType.Recording,
        )
        expect(
            await findByText('Unable to load call transcription.'),
        ).toBeInTheDocument()
        expect(getByText('Try again')).toBeInTheDocument()

        fireEvent.click(getByText('Try again'))
        await waitFor(() => {
            expect(requestCount).toBeGreaterThan(1)
        })
    })

    it('should render permanent error recording correctly', async () => {
        mockTranscription({
            ...callRecordingTranscription,
            error_message: 'Could not transcribe.',
        })

        const { findByText, queryByText } = renderComponent(
            VoiceCallRecordingType.Recording,
        )
        expect(
            await findByText('Unable to load call transcription.'),
        ).toBeInTheDocument()
        expect(queryByText('Try again')).not.toBeInTheDocument()
    })

    it('should render poor quality message correctly', async () => {
        mockTranscription({
            ...callRecordingTranscription,
            transcription: [],
        })

        const { findByText } = renderComponent(VoiceCallRecordingType.Recording)
        expect(
            await findByText(
                'Audio quality of this call was too poor to generate an accurate transcription. Please check your microphone and internet quality to ensure clear audio.',
            ),
        ).toBeInTheDocument()
    })

    it('should handle empty speaker list', async () => {
        mockTranscription({
            ...callRecordingTranscription,
            speakers: [],
        })

        const { findByText, getAllByText } = renderComponent(
            VoiceCallRecordingType.Recording,
        )
        await findByText('Hello.')
        expect(getAllByText('Speaker undefined')).toHaveLength(7)
    })
})
