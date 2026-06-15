import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListUsersHandler,
    mockListUsersResponse,
    mockListVoiceCallEventsHandler,
    mockListVoiceCallEventsResponse,
    mockVoiceCallEvent,
} from '@gorgias/helpdesk-mocks'
import { VoiceCallTerminationStatus } from '@gorgias/helpdesk-types'

import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { VoiceCallEvents } from '../components/TicketThreadCallItem/components/VoiceCallEvents'
import { PhoneIntegrationEvent } from '../models/voiceCallEventTypes'

const emptyEventsHandler = mockListVoiceCallEventsHandler(async () =>
    HttpResponse.json(mockListVoiceCallEventsResponse({ data: [] })),
)

const emptyUsersHandler = mockListUsersHandler(async () =>
    HttpResponse.json(
        mockListUsersResponse({
            data: [],
            meta: { prev_cursor: null, next_cursor: null },
        }),
    ),
)

describe('VoiceCallEvents', () => {
    describe('when events fetch fails', () => {
        beforeEach(() => {
            server.use(
                getCurrentUserHandler().handler,
                emptyUsersHandler.handler,
                mockListVoiceCallEventsHandler(async () =>
                    HttpResponse.json(
                        { error: 'Internal Server Error' } as any,
                        { status: 500 },
                    ),
                ).handler,
            )
        })

        it('renders error message when fetch fails', async () => {
            render(<VoiceCallEvents callId={1} />)

            await waitFor(() => {
                expect(
                    screen.getByText('Call events are not available.'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('when events are loaded', () => {
        beforeEach(() => {
            const answeredEvent = mockVoiceCallEvent({
                id: 1,
                call_id: 1,
                type: PhoneIntegrationEvent.PhoneCallAnswered,
                user_id: undefined,
                created_datetime: '2024-03-21T11:00:00Z',
                meta: {},
            })

            server.use(
                getCurrentUserHandler().handler,
                emptyUsersHandler.handler,
                mockListVoiceCallEventsHandler(async () =>
                    HttpResponse.json(
                        mockListVoiceCallEventsResponse({
                            data: [answeredEvent],
                        }),
                    ),
                ).handler,
            )
        })

        it('renders event items for PhoneCallAnswered event type', async () => {
            render(<VoiceCallEvents callId={1} />)

            await waitFor(() => {
                expect(screen.getByText('Answered')).toBeInTheDocument()
            })
        })
    })

    describe('when events are empty with Abandoned termination status', () => {
        beforeEach(() => {
            server.use(
                getCurrentUserHandler().handler,
                emptyUsersHandler.handler,
                emptyEventsHandler.handler,
            )
        })

        it('renders message about caller ending the call while waiting', async () => {
            render(
                <VoiceCallEvents
                    callId={1}
                    terminationStatus={VoiceCallTerminationStatus.Abandoned}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'No events. The caller ended the call while waiting, before reaching an available agent.',
                    ),
                ).toBeInTheDocument()
            })
        })
    })

    describe('when events are empty and termination is Cancelled', () => {
        beforeEach(() => {
            server.use(
                getCurrentUserHandler().handler,
                emptyUsersHandler.handler,
                emptyEventsHandler.handler,
            )
        })

        it('renders message about caller ending the call while waiting', async () => {
            render(
                <VoiceCallEvents
                    callId={1}
                    terminationStatus={VoiceCallTerminationStatus.Cancelled}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByText(/ended the call while waiting/),
                ).toBeInTheDocument()
            })
        })
    })

    describe('when events are empty without special termination status', () => {
        beforeEach(() => {
            server.use(
                getCurrentUserHandler().handler,
                emptyUsersHandler.handler,
                emptyEventsHandler.handler,
            )
        })

        it('renders generic outside business hours message', async () => {
            render(<VoiceCallEvents callId={1} />)

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'No events. This call was either made outside business hours or ended due to no available agents.',
                    ),
                ).toBeInTheDocument()
            })
        })
    })
})
