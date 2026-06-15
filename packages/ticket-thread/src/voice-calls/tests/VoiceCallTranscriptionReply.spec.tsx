import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { VoiceCallTranscriptionReply } from '../components/TicketThreadCallItem/components/VoiceCallTranscriptionReply'

const testAgent = mockUser({ id: 42, name: 'Agent Smith' })

describe('VoiceCallTranscriptionReply', () => {
    it('renders the transcript text', () => {
        render(
            <VoiceCallTranscriptionReply
                channel={0}
                speaker={0}
                start={0}
                transcript="Hello, can you hear me?"
                speakerMapping={{}}
            />,
        )
        expect(screen.getByText('Hello, can you hear me?')).toBeInTheDocument()
    })

    it('formats start time correctly (65 seconds → "01:05")', () => {
        render(
            <VoiceCallTranscriptionReply
                channel={0}
                speaker={0}
                start={65}
                transcript="Some response"
                speakerMapping={{}}
            />,
        )
        expect(screen.getByText('01:05')).toBeInTheDocument()
    })

    it('formats start time of 0 seconds as "00:00"', () => {
        render(
            <VoiceCallTranscriptionReply
                channel={0}
                speaker={0}
                start={0}
                transcript="Opening statement"
                speakerMapping={{}}
            />,
        )
        expect(screen.getByText('00:00')).toBeInTheDocument()
    })

    it('renders "Speaker undefined" fallback when no mapping exists', () => {
        render(
            <VoiceCallTranscriptionReply
                channel={0}
                speaker={1}
                start={10}
                transcript="Some message"
                speakerMapping={{}}
            />,
        )
        expect(screen.getByText(/Speaker/)).toBeInTheDocument()
    })

    describe('when speakerMapping includes agent_id', () => {
        beforeEach(() => {
            server.use(
                mockListUsersHandler(async () =>
                    HttpResponse.json(
                        mockListUsersResponse({
                            data: [testAgent],
                            meta: { prev_cursor: null, next_cursor: null },
                        }),
                    ),
                ).handler,
            )
        })

        it('renders agent name when speakerMapping includes agent_id', async () => {
            render(
                <VoiceCallTranscriptionReply
                    channel={0}
                    speaker={0}
                    start={10}
                    transcript="Agent speaking"
                    speakerMapping={{
                        '0-0': {
                            channel: 0,
                            speaker: 0,
                            index_in_recording: 0,
                            agent_id: 42,
                            customer_id: null,
                        },
                    }}
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('Agent Smith')).toBeInTheDocument()
            })
        })
    })
})
