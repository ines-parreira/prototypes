import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockCustomer,
    mockGetCustomerHandler,
    mockGetVoiceQueueHandler,
    mockGetVoiceQueueResponse,
    mockListUsersHandler,
    mockListUsersResponse,
    mockListVoiceCallEventsHandler,
    mockListVoiceCallEventsResponse,
    mockUser,
    mockVoiceCall,
} from '@gorgias/helpdesk-mocks'
import { PhoneRingingBehaviour } from '@gorgias/helpdesk-queries'
import {
    VoiceCallStatus,
    VoiceCallTerminationStatus,
} from '@gorgias/helpdesk-types'

import { getCurrentUserHandler } from '#tests/getCurrentUser.mock'
import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { VoiceCallInboundStatus } from '#voice-calls/components/TicketThreadCallItem/components/VoiceCallInboundStatus'

const agent = mockUser({ id: 5, name: 'Alice Agent' })

beforeEach(() => {
    server.use(
        getCurrentUserHandler().handler,
        mockListUsersHandler(async () =>
            HttpResponse.json(
                mockListUsersResponse({
                    data: [agent],
                    meta: { prev_cursor: null, next_cursor: null },
                }),
            ),
        ).handler,
        mockGetCustomerHandler(async () =>
            HttpResponse.json(mockCustomer({ id: 1 })),
        ).handler,
        mockListVoiceCallEventsHandler(async () =>
            HttpResponse.json(mockListVoiceCallEventsResponse({ data: [] })),
        ).handler,
        mockGetVoiceQueueHandler(async () =>
            HttpResponse.json(
                mockGetVoiceQueueResponse({ id: 1, name: 'Support Queue' }),
            ),
        ).handler,
    )
})

describe('VoiceCallInboundStatus', () => {
    it('renders Routing text for Ringing status', async () => {
        const voiceCall = mockVoiceCall({ status: VoiceCallStatus.Ringing })
        render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Routing')).toBeInTheDocument()
        })
    })

    it('renders "Answered by" for Completed+Answered termination', async () => {
        const voiceCall = mockVoiceCall({
            status: VoiceCallStatus.Completed,
            termination_status: VoiceCallTerminationStatus.Answered,
            last_answered_by_agent_id: 5,
        })
        render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Answered by')).toBeInTheDocument()
        })
    })

    it('renders "Missed call" text for Missed termination', async () => {
        const voiceCall = mockVoiceCall({
            status: VoiceCallStatus.Completed,
            termination_status: VoiceCallTerminationStatus.Missed,
            last_answered_by_agent_id: undefined,
        })
        render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Missed call')).toBeInTheDocument()
        })
    })

    it('renders "Callback requested" for CallbackRequested termination', async () => {
        const voiceCall = mockVoiceCall({
            status: VoiceCallStatus.Completed,
            termination_status: VoiceCallTerminationStatus.CallbackRequested,
            last_answered_by_agent_id: undefined,
        })
        render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Callback requested')).toBeInTheDocument()
        })
    })

    it('renders "Queued" text for Queued status without transfer', async () => {
        const voiceCall = mockVoiceCall({
            direction: 'inbound',
            status: VoiceCallStatus.Queued,
            last_answered_by_agent_id: undefined,
            answered_by_external_number: undefined,
        })
        render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Queued')).toBeInTheDocument()
        })
    })

    it('renders "Transferring to queue" for Queued with transfer context', async () => {
        const voiceCall = mockVoiceCall({
            status: VoiceCallStatus.Queued,
            last_answered_by_agent_id: 5,
        })
        render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(
                screen.getByText('Transferring to queue...'),
            ).toBeInTheDocument()
        })
    })

    it('renders "Cancelled call" for Cancelled termination', async () => {
        const voiceCall = {
            ...mockVoiceCall({ status: VoiceCallStatus.Completed }),
            termination_status: VoiceCallTerminationStatus.Cancelled,
            last_answered_by_agent_id: undefined,
        }
        render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Cancelled call')).toBeInTheDocument()
        })
    })

    it('renders "Abandoned call" for Abandoned termination', async () => {
        const voiceCall = mockVoiceCall({
            status: VoiceCallStatus.Completed,
            termination_status: VoiceCallTerminationStatus.Abandoned,
            last_answered_by_agent_id: undefined,
        })
        render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Abandoned call')).toBeInTheDocument()
        })
    })

    it('renders "Answered by" for InProgress status (Answered voice call status)', async () => {
        const voiceCall = mockVoiceCall({
            status: VoiceCallStatus.Answered,
            last_answered_by_agent_id: 5,
        })
        render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Answered by')).toBeInTheDocument()
        })
    })

    it('renders nothing for an unrecognised status', () => {
        const voiceCall = mockVoiceCall({
            status: 'unknown' as VoiceCallStatus,
        })
        const { container } = render(
            <VoiceCallInboundStatus voiceCall={voiceCall} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    describe('CallingStatus', () => {
        it('renders "Calling agents" when distribution mode is Broadcast', async () => {
            server.use(
                mockGetVoiceQueueHandler(async () =>
                    HttpResponse.json(
                        mockGetVoiceQueueResponse({
                            id: 1,
                            distribution_mode: PhoneRingingBehaviour.Broadcast,
                        }),
                    ),
                ).handler,
            )

            const voiceCall = mockVoiceCall({
                status: VoiceCallStatus.Queued,
                status_in_queue: 'distributing',
                last_answered_by_agent_id: undefined,
                answered_by_external_number: undefined,
                queue_id: 1,
            })
            render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
            await waitFor(() => {
                expect(screen.getByText('Calling agents')).toBeInTheDocument()
            })
        })

        it('renders "Calling" with agent label when distribution mode is not Broadcast', async () => {
            const voiceCall = mockVoiceCall({
                status: VoiceCallStatus.Queued,
                status_in_queue: 'distributing',
                last_answered_by_agent_id: undefined,
                answered_by_external_number: undefined,
                last_rang_agent_id: 5,
                queue_id: 1,
            })
            render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
            await waitFor(() => {
                expect(screen.getByText(/Calling/)).toBeInTheDocument()
            })
        })

        it('renders verb text with skeleton while queue data is loading', () => {
            const voiceCall = mockVoiceCall({
                status: VoiceCallStatus.Queued,
                status_in_queue: 'distributing',
                last_answered_by_agent_id: undefined,
                answered_by_external_number: undefined,
                queue_id: 1,
            })
            render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
            expect(screen.getByText(/Calling/)).toBeInTheDocument()
        })

        it('renders verb text with skeleton when queue fetch errors', async () => {
            server.use(
                mockGetVoiceQueueHandler(async () =>
                    HttpResponse.json(mockGetVoiceQueueResponse({ id: 1 }), {
                        status: 500,
                    }),
                ).handler,
            )

            const voiceCall = mockVoiceCall({
                status: VoiceCallStatus.Queued,
                status_in_queue: 'distributing',
                last_answered_by_agent_id: undefined,
                answered_by_external_number: undefined,
                queue_id: 1,
            })
            render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
            await waitFor(() => {
                expect(screen.getByText(/Calling/)).toBeInTheDocument()
            })
        })

        it('renders "Transferring to agents" when isTransfer and distribution mode is Broadcast', async () => {
            server.use(
                mockGetVoiceQueueHandler(async () =>
                    HttpResponse.json(
                        mockGetVoiceQueueResponse({
                            id: 1,
                            distribution_mode: PhoneRingingBehaviour.Broadcast,
                        }),
                    ),
                ).handler,
            )

            const voiceCall = mockVoiceCall({
                status: VoiceCallStatus.Queued,
                status_in_queue: 'distributing',
                last_answered_by_agent_id: 5,
                queue_id: 1,
            })
            render(<VoiceCallInboundStatus voiceCall={voiceCall} />)
            await waitFor(() => {
                expect(
                    screen.getByText('Transferring to agents'),
                ).toBeInTheDocument()
            })
        })
    })
})
