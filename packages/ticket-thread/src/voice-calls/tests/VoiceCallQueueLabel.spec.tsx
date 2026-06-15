import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetVoiceQueueHandler,
    mockGetVoiceQueueResponse,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { VoiceCallQueueLabel } from '../components/TicketThreadCallItem/components/VoiceCallQueueLabel'

describe('VoiceCallQueueLabel', () => {
    describe('when queue has a name', () => {
        beforeEach(() => {
            server.use(
                mockGetVoiceQueueHandler(async () =>
                    HttpResponse.json(
                        mockGetVoiceQueueResponse({
                            id: 1,
                            name: 'Support Queue',
                        }),
                    ),
                ).handler,
            )
        })

        it('renders queue name when loaded', async () => {
            render(<VoiceCallQueueLabel queueId={1} />)

            await waitFor(() => {
                expect(screen.getByText('Support Queue')).toBeInTheDocument()
            })
        })
    })

    describe('when queue name is missing', () => {
        beforeEach(() => {
            server.use(
                mockGetVoiceQueueHandler(async () =>
                    HttpResponse.json(
                        mockGetVoiceQueueResponse({ id: 7, name: undefined }),
                    ),
                ).handler,
            )
        })

        it('falls back to "Queue N" when name is missing', async () => {
            render(<VoiceCallQueueLabel queueId={7} />)

            await waitFor(() => {
                expect(screen.getByText('Queue 7')).toBeInTheDocument()
            })
        })
    })
})
