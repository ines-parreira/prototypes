import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockCustomer,
    mockGetCustomerHandler,
    mockGetVoiceQueueHandler,
    mockGetVoiceQueueResponse,
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { VoiceCallSubjectLabel } from '#voice-calls/components/TicketThreadCallItem/components/VoiceCallSubjectLabel'
import { VoiceCallSubjectType } from '#voice-calls/models/types'

describe('VoiceCallSubjectLabel', () => {
    describe('Agent subject', () => {
        beforeEach(() => {
            server.use(
                mockListUsersHandler(async () =>
                    HttpResponse.json(
                        mockListUsersResponse({
                            data: [mockUser({ id: 10, name: 'Bob Agent' })],
                            meta: { prev_cursor: null, next_cursor: null },
                        }),
                    ),
                ).handler,
                mockGetVoiceQueueHandler(async () =>
                    HttpResponse.json(
                        mockGetVoiceQueueResponse({ id: 1, name: 'Queue' }),
                    ),
                ).handler,
                mockGetCustomerHandler(async () =>
                    HttpResponse.json(
                        mockCustomer({ id: 1, name: 'Customer' }),
                    ),
                ).handler,
            )
        })

        it('renders agent name for Agent subject type', async () => {
            render(
                <VoiceCallSubjectLabel
                    subject={{ type: VoiceCallSubjectType.Agent, id: 10 }}
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('Bob Agent')).toBeInTheDocument()
            })
        })
    })

    describe('External subject with customer', () => {
        beforeEach(() => {
            server.use(
                mockGetCustomerHandler(async () =>
                    HttpResponse.json(
                        mockCustomer({ id: 5, name: 'Jane Customer' }),
                    ),
                ).handler,
                mockListUsersHandler(async () =>
                    HttpResponse.json(
                        mockListUsersResponse({
                            data: [],
                            meta: { prev_cursor: null, next_cursor: null },
                        }),
                    ),
                ).handler,
                mockGetVoiceQueueHandler(async () =>
                    HttpResponse.json(
                        mockGetVoiceQueueResponse({ id: 1, name: 'Queue' }),
                    ),
                ).handler,
            )
        })

        it('renders customer name for External subject with customer id', async () => {
            render(
                <VoiceCallSubjectLabel
                    subject={{
                        type: VoiceCallSubjectType.External,
                        value: '+12025551234',
                        customer: { id: 5 },
                    }}
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('Jane Customer')).toBeInTheDocument()
            })
        })
    })

    describe('External subject without customer', () => {
        beforeEach(() => {
            server.use(
                mockListUsersHandler(async () =>
                    HttpResponse.json(
                        mockListUsersResponse({
                            data: [],
                            meta: { prev_cursor: null, next_cursor: null },
                        }),
                    ),
                ).handler,
                mockGetVoiceQueueHandler(async () =>
                    HttpResponse.json(
                        mockGetVoiceQueueResponse({ id: 1, name: 'Queue' }),
                    ),
                ).handler,
            )
        })

        it('renders formatted phone number for External subject without customer', () => {
            render(
                <VoiceCallSubjectLabel
                    subject={{
                        type: VoiceCallSubjectType.External,
                        value: '+12025551234',
                        customer: null,
                    }}
                />,
            )

            expect(screen.getByText('+1 202 555 1234')).toBeInTheDocument()
        })
    })

    describe('Queue subject', () => {
        beforeEach(() => {
            server.use(
                mockGetVoiceQueueHandler(async () =>
                    HttpResponse.json(
                        mockGetVoiceQueueResponse({
                            id: 3,
                            name: 'Sales Queue',
                        }),
                    ),
                ).handler,
                mockListUsersHandler(async () =>
                    HttpResponse.json(
                        mockListUsersResponse({
                            data: [],
                            meta: { prev_cursor: null, next_cursor: null },
                        }),
                    ),
                ).handler,
            )
        })

        it('renders queue name for Queue subject type', async () => {
            render(
                <VoiceCallSubjectLabel
                    subject={{ type: VoiceCallSubjectType.Queue, id: 3 }}
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('Sales Queue')).toBeInTheDocument()
            })
        })
    })

    describe('IvrMenuOption subject', () => {
        beforeEach(() => {
            server.use(
                mockListUsersHandler(async () =>
                    HttpResponse.json(
                        mockListUsersResponse({
                            data: [],
                            meta: { prev_cursor: null, next_cursor: null },
                        }),
                    ),
                ).handler,
                mockGetVoiceQueueHandler(async () =>
                    HttpResponse.json(
                        mockGetVoiceQueueResponse({ id: 1, name: 'Queue' }),
                    ),
                ).handler,
            )
        })

        it('renders "IVR Option {digit}" for IvrMenuOption subject type', () => {
            render(
                <VoiceCallSubjectLabel
                    subject={{
                        type: VoiceCallSubjectType.IvrMenuOption,
                        digit: '3',
                    }}
                />,
            )

            expect(screen.getByText('IVR Option 3')).toBeInTheDocument()
        })
    })
})
