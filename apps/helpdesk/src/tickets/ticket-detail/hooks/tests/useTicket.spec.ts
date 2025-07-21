import { useGetTicket } from '@gorgias/helpdesk-queries'

import { TICKET_QUERIES_DEFAULT_CONFIG } from 'tickets/ticket-detail/constants'
import { renderHook } from 'utils/testing/renderHook'

import { useAllEvents } from '../useAllEvents'
import { useAllVoiceCalls } from '../useAllVoiceCalls'
import { useTicket } from '../useTicket'

jest.mock('@gorgias/helpdesk-queries', () => ({ useGetTicket: jest.fn() }))
const useGetTicketMock = useGetTicket as jest.Mock

jest.mock('../../transformers', () => ({ transformers: [] }))

jest.mock('../useAllEvents', () => ({ useAllEvents: jest.fn() }))
const useAllEventsMock = useAllEvents as jest.Mock

jest.mock('../useAllVoiceCalls', () => ({ useAllVoiceCalls: jest.fn() }))
const useAllVoiceCallsMock = useAllVoiceCalls as jest.Mock

describe('useTicket', () => {
    beforeEach(() => {
        useAllEventsMock.mockReturnValue({ data: [], isLoading: true })
        useAllVoiceCallsMock.mockReturnValue({ data: [], isLoading: true })
        useGetTicketMock.mockReturnValue({ data: undefined, isLoading: true })
    })

    it('should return the loading state', () => {
        const { result } = renderHook(() => useTicket(1))
        expect(result.current).toEqual({
            body: [],
            isLoading: true,
            ticket: undefined,
        })
    })

    it('should call getTicket with the correct params', () => {
        renderHook(() => useTicket(1))
        expect(useGetTicket).toHaveBeenCalledWith(1, undefined, {
            query: TICKET_QUERIES_DEFAULT_CONFIG,
        })
    })

    it('should return the ticket after loading', () => {
        const ticket = {
            id: 1,
            messages: [
                { id: 1, created_datetime: '2025-05-15T15:15:00' },
                { id: 2, created_datetime: '2025-05-15T15:10:00' },
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
        useGetTicketMock.mockReturnValue({
            data: { data: ticket },
            isLoading: false,
        })

        const { result } = renderHook(() => useTicket(1))
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
            ticket,
        })
    })
})
