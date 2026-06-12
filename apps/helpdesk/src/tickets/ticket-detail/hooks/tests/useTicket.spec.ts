import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockGetTicketHandler,
    mockGetTicketResponse,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import { useAllEvents } from '../useAllEvents'
import { useAllVoiceCalls } from '../useAllVoiceCalls'
import { useTicket } from '../useTicket'

jest.mock('../../transformers', () => ({ transformers: [] }))

jest.mock('../useAllEvents', () => ({ useAllEvents: jest.fn() }))
const useAllEventsMock = useAllEvents as jest.Mock

jest.mock('../useAllVoiceCalls', () => ({ useAllVoiceCalls: jest.fn() }))
const useAllVoiceCallsMock = useAllVoiceCalls as jest.Mock

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

describe('useTicket', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useAllEventsMock.mockReturnValue({ events: [], isLoading: true })
        useAllVoiceCallsMock.mockReturnValue({
            voiceCalls: [],
            isLoading: true,
        })
        server.use(
            mockGetTicketHandler(async () => new Promise(() => undefined))
                .handler,
        )
    })

    it('should return the loading state', () => {
        const { result } = renderHook(() => useTicket(1))
        expect(result.current).toEqual({
            body: [],
            isLoading: true,
            ticket: undefined,
        })
    })

    it('should call getTicket with the correct params', async () => {
        const getTicketMock = mockGetTicketHandler()
        server.use(getTicketMock.handler)
        const waitForGetTicketRequest = getTicketMock.waitForRequest(server)

        renderHook(() => useTicket(1))

        await waitForGetTicketRequest((request) => {
            expect(request.url).toContain('/api/tickets/1')
        })
    })

    it('should return the ticket after loading', async () => {
        const ticket = {
            id: 1,
            messages: [
                mockTicketMessage({
                    id: 1,
                    created_datetime: '2025-05-15T15:15:00',
                }),
                mockTicketMessage({
                    id: 2,
                    created_datetime: '2025-05-15T15:10:00',
                }),
            ],
        }
        const events = [{ id: 3, created_datetime: '2025-05-15T15:12:00' }]
        const voiceCalls = [{ id: 4, created_datetime: '2025-05-15T15:13:00' }]

        useAllEventsMock.mockReturnValue({
            events,
            isLoading: false,
        })
        useAllVoiceCallsMock.mockReturnValue({
            voiceCalls,
            isLoading: false,
        })
        server.use(
            mockGetTicketHandler(async () =>
                HttpResponse.json(mockGetTicketResponse(ticket)),
            ).handler,
        )

        const { result } = renderHook(() => useTicket(1))

        await waitFor(() => {
            expect(result.current).toEqual({
                body: [
                    {
                        data: ticket.messages[1],
                        datetime: ticket.messages[1].created_datetime,
                        type: 'message',
                    },
                    {
                        data: events[0],
                        datetime: events[0].created_datetime,
                        type: 'event',
                    },
                    {
                        data: voiceCalls[0],
                        datetime: voiceCalls[0].created_datetime,
                        type: 'voice-call',
                    },
                    {
                        data: ticket.messages[0],
                        datetime: ticket.messages[0].created_datetime,
                        type: 'message',
                    },
                ],
                isLoading: false,
                ticket: expect.objectContaining(ticket),
            })
        })
    })
})
