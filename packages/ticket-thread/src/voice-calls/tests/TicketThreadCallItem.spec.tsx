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

import { getCurrentUserHandler } from '../../tests/getCurrentUser.mock'
import { render } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { TicketThreadItemTag } from '../../thread/itemTags'
import { TicketThreadCallItem } from '../components/TicketThreadCallItem/TicketThreadCallIItem'
import type {
    TicketThreadOutboundVoiceCallItem,
    TicketThreadVoiceCallItem,
} from '../types'

const testCustomer = mockCustomer({
    id: 100,
    name: 'John Doe',
    firstname: 'John',
    lastname: 'Doe',
})

const testAgent = mockUser({
    id: 200,
    name: 'Agent Smith',
})

const getCustomerHandler = mockGetCustomerHandler(async () =>
    HttpResponse.json(testCustomer),
)

const getUsersHandler = mockListUsersHandler(async () =>
    HttpResponse.json(
        mockListUsersResponse({
            data: [testAgent],
            meta: {
                prev_cursor: null,
                next_cursor: null,
            },
        }),
    ),
)

const getVoiceCallEventsHandler = mockListVoiceCallEventsHandler(async () =>
    HttpResponse.json(mockListVoiceCallEventsResponse({ data: [] })),
)

const getVoiceCallRecordingsHandler = mockListVoiceCallRecordingsHandler(
    async () =>
        HttpResponse.json(mockListVoiceCallRecordingsResponse({ data: [] })),
)

beforeEach(() => {
    server.use(
        getCurrentUserHandler().handler,
        getCustomerHandler.handler,
        getUsersHandler.handler,
        getVoiceCallEventsHandler.handler,
        getVoiceCallRecordingsHandler.handler,
    )
})

function renderItem(
    item: TicketThreadVoiceCallItem | TicketThreadOutboundVoiceCallItem,
) {
    return render(<TicketThreadCallItem item={item} />)
}

describe('TicketThreadCallItem', () => {
    it('renders an inbound voice call item with "called"', async () => {
        renderItem({
            _tag: TicketThreadItemTag.VoiceCalls.VoiceCall,
            data: mockVoiceCall({
                id: 1,
                direction: 'inbound',
                status: 'completed',
                customer_id: 100,
                phone_number_source: '+1234567890',
                phone_number_destination: '+0987654321',
                created_datetime: '2024-03-21T11:00:00Z',
                started_datetime: '2024-03-21T11:00:00Z',
                duration: 120,
                last_answered_by_agent_id: 200,
            }),
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadVoiceCallItem)

        await waitFor(() => {
            expect(screen.getByText('called')).toBeInTheDocument()
        })
    })

    it('renders an outbound voice call item with "made a call"', async () => {
        renderItem({
            _tag: TicketThreadItemTag.VoiceCalls.OutboundVoiceCall,
            data: mockVoiceCall({
                id: 2,
                direction: 'outbound',
                status: 'completed',
                customer_id: 100,
                initiated_by_agent_id: 200,
                phone_number_source: '+0987654321',
                phone_number_destination: '+1234567890',
                created_datetime: '2024-03-21T11:00:00Z',
                started_datetime: '2024-03-21T11:00:00Z',
                duration: 60,
            }),
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadOutboundVoiceCallItem)

        await waitFor(() => {
            expect(screen.getByText('made a call')).toBeInTheDocument()
        })
    })
})
