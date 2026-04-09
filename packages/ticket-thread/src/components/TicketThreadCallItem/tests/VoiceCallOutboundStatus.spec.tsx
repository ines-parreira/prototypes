import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockCustomer,
    mockGetCustomerHandler,
    mockListUsersHandler,
    mockListUsersResponse,
    mockListVoiceCallEventsHandler,
    mockListVoiceCallEventsResponse,
    mockVoiceCall,
} from '@gorgias/helpdesk-mocks'
import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { VoiceCallOutboundStatus } from '../components/VoiceCallOutboundStatus'

beforeEach(() => {
    server.use(
        getCurrentUserHandler().handler,
        mockGetCustomerHandler(async () =>
            HttpResponse.json(mockCustomer({ id: 1, name: 'John Customer' })),
        ).handler,
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
    )
})

describe('VoiceCallOutboundStatus', () => {
    it('renders "Waiting for" with customer name for Ringing status', async () => {
        const voiceCall = mockVoiceCall({
            status: VoiceCallStatus.Ringing,
            customer_id: 1,
            phone_number_destination: '+12025551234',
        })
        render(<VoiceCallOutboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Waiting for')).toBeInTheDocument()
            expect(screen.getByText('John Customer')).toBeInTheDocument()
        })
    })

    it('renders "Answered by" for Answered status', async () => {
        const voiceCall = mockVoiceCall({
            status: VoiceCallStatus.Answered,
            customer_id: 1,
            phone_number_destination: '+12025551234',
        })
        render(<VoiceCallOutboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Answered by')).toBeInTheDocument()
        })
    })

    it('renders "Unanswered by" for NoAnswer status', async () => {
        const voiceCall = mockVoiceCall({
            status: VoiceCallStatus.NoAnswer,
            customer_id: 1,
            phone_number_destination: '+12025551234',
        })
        render(<VoiceCallOutboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(screen.getByText('Unanswered by')).toBeInTheDocument()
        })
    })

    it('renders failure message for Failed status', async () => {
        const voiceCall = mockVoiceCall({
            status: VoiceCallStatus.Failed,
            customer_id: 1,
        })
        render(<VoiceCallOutboundStatus voiceCall={voiceCall} />)
        await waitFor(() => {
            expect(
                screen.getByText(/could not connect the call/),
            ).toBeInTheDocument()
        })
    })

    it('renders nothing for unknown status', () => {
        const voiceCall = mockVoiceCall({
            status: 'unknown' as VoiceCallStatus,
            customer_id: 1,
        })
        const { container } = render(
            <VoiceCallOutboundStatus voiceCall={voiceCall} />,
        )
        expect(container).toBeEmptyDOMElement()
    })
})
