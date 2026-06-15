import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockCustomer,
    mockGetCustomerHandler,
    mockListUsersHandler,
    mockListUsersResponse,
    mockListVoiceCallEventsHandler,
    mockListVoiceCallEventsResponse,
    mockListVoiceCallRecordingsHandler,
    mockListVoiceCallRecordingsResponse,
    mockVoiceCall,
} from '@gorgias/helpdesk-mocks'
import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { VoiceCallInbound } from '../components/TicketThreadCallItem/components/VoiceCallInbound'

const customer = mockCustomer({
    id: 1,
    name: 'Jane Customer',
    email: 'jane@example.com',
})

beforeEach(() => {
    server.use(
        getCurrentUserHandler().handler,
        mockGetCustomerHandler(async () => HttpResponse.json(customer)).handler,
        mockListUsersHandler(async () =>
            HttpResponse.json(
                mockListUsersResponse({
                    data: [],
                    meta: { prev_cursor: null, next_cursor: null },
                }),
            ),
        ).handler,
        mockListVoiceCallEventsHandler(async () =>
            HttpResponse.json(mockListVoiceCallEventsResponse({ data: [] })),
        ).handler,
        mockListVoiceCallRecordingsHandler(async () =>
            HttpResponse.json(
                mockListVoiceCallRecordingsResponse({ data: [] }),
            ),
        ).handler,
    )
})

describe('VoiceCallInbound', () => {
    it('renders customer name when loaded', async () => {
        const voiceCall = mockVoiceCall({
            direction: 'inbound',
            status: VoiceCallStatus.Completed,
            customer_id: 1,
            phone_number_source: '+12025551234',
        })
        render(<VoiceCallInbound voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Jane Customer')).toBeInTheDocument()
        })
    })

    it('renders "called" for a final status', async () => {
        const voiceCall = mockVoiceCall({
            direction: 'inbound',
            status: VoiceCallStatus.Completed,
            customer_id: 1,
            phone_number_source: '+12025551234',
        })
        render(<VoiceCallInbound voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('called')).toBeInTheDocument()
        })
    })

    it('renders "is calling" for an active status', async () => {
        const voiceCall = mockVoiceCall({
            direction: 'inbound',
            status: VoiceCallStatus.Ringing,
            customer_id: 1,
            phone_number_source: '+12025551234',
        })
        render(<VoiceCallInbound voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('is calling')).toBeInTheDocument()
        })
    })
})
