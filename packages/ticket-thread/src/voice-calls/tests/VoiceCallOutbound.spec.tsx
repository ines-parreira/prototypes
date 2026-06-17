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
    mockUser,
    mockVoiceCall,
} from '@gorgias/helpdesk-mocks'
import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { getCurrentUserHandler } from '#tests/getCurrentUser.mock'
import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { VoiceCallOutbound } from '#voice-calls/components/TicketThreadCallItem/components/VoiceCallOutbound'

const agent = mockUser({ id: 5, name: 'Bob Agent' })

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
        mockListVoiceCallRecordingsHandler(async () =>
            HttpResponse.json(
                mockListVoiceCallRecordingsResponse({ data: [] }),
            ),
        ).handler,
    )
})

describe('VoiceCallOutbound', () => {
    it('renders agent name in header', async () => {
        const voiceCall = mockVoiceCall({
            direction: 'outbound',
            status: VoiceCallStatus.Completed,
            customer_id: 1,
            initiated_by_agent_id: 5,
            phone_number_source: '+10987654321',
        })
        render(<VoiceCallOutbound voiceCall={voiceCall as any} />)
        await waitFor(() => {
            expect(screen.getByText('Bob Agent')).toBeInTheDocument()
        })
    })

    it('renders "made a call" for a final status', async () => {
        const voiceCall = mockVoiceCall({
            direction: 'outbound',
            status: VoiceCallStatus.Completed,
            customer_id: 1,
            initiated_by_agent_id: 5,
        })
        render(<VoiceCallOutbound voiceCall={voiceCall as any} />)
        await waitFor(() => {
            expect(screen.getByText('made a call')).toBeInTheDocument()
        })
    })

    it('renders "is making a call" for an active status', async () => {
        const voiceCall = mockVoiceCall({
            direction: 'outbound',
            status: VoiceCallStatus.Ringing,
            customer_id: 1,
            initiated_by_agent_id: 5,
        })
        render(<VoiceCallOutbound voiceCall={voiceCall as any} />)
        await waitFor(() => {
            expect(screen.getByText('is making a call')).toBeInTheDocument()
        })
    })
})
