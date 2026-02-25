import { renderHook } from '@testing-library/react'

import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { useListTicketMessages } from '../../shared/useListTicketMessages'
import { TicketThreadItemTag } from '../../types'
import type { TicketThreadMessageItem } from '../types'
import { useTicketThreadMessages } from '../useTicketThreadMessages'

vi.mock('../../shared/useListTicketMessages', () => ({
    useListTicketMessages: vi.fn(),
}))

const mockUseListTicketMessages = vi.mocked(useListTicketMessages)

function createMessage(overrides: Partial<TicketMessage>): TicketMessage {
    return {
        id: 1,
        channel: 'email',
        from_agent: false,
        via: 'email',
        created_datetime: '2024-03-21T11:00:00Z',
        sender: {
            id: 10,
            email: 'customer@gorgias.com',
            name: 'Customer',
        },
        public: true,
        body_html: '<p>hello</p>',
        body_text: 'hello',
        source: { type: 'email' },
        meta: null,
        ...overrides,
    } as TicketMessage
}

function getMessageIds(items: TicketThreadMessageItem[]): number[] {
    return items.flatMap((item) => {
        if (item._tag === TicketThreadItemTag.Messages.MergedMessages) {
            return item.data.map((message) => message.data.id as number)
        }

        return [item.data.id as number]
    })
}

describe('useTicketThreadMessages', () => {
    beforeEach(() => {
        mockUseListTicketMessages.mockReturnValue([])
    })

    it('keeps legacy ordering between persisted/failed and active pending buckets', () => {
        mockUseListTicketMessages.mockReturnValue([
            createMessage({
                id: 10,
                created_datetime: '2024-03-21T10:00:00Z',
            }),
            createMessage({
                id: 20,
                created_datetime: '2024-03-21T10:01:00Z',
                meta: { hidden: true } as any,
            }),
            createMessage({
                id: 30,
                created_datetime: '2024-03-21T10:02:00Z',
                meta: { type: 'signal' } as any,
            }),
        ])

        const pendingMessages: unknown[] = [
            createMessage({
                id: 40,
                created_datetime: '2024-03-21T10:20:00Z',
                failed_datetime: '2024-03-21T10:21:00Z',
            } as TicketMessage),
            createMessage({
                id: 50,
                created_datetime: '2024-03-21T10:30:00Z',
                failed_datetime: null,
            } as TicketMessage),
        ]

        const { result } = renderHook(() =>
            useTicketThreadMessages({
                ticketId: 123,
                pendingMessages,
            }),
        )

        // Legacy parity: selectors#getBody concatenates failed pending messages
        // with persisted messages before sorting, while active pending messages
        // stay in a dedicated trailing section.
        expect(getMessageIds(result.current.messages)).toEqual([10, 40])
        expect(getMessageIds(result.current.activePendingMessages)).toEqual([
            50,
        ])
    })

    it('ignores non-ticket pending payloads', () => {
        const pendingMessages: unknown[] = [
            {
                id: 'invalid',
                created_datetime: '2024-03-21T10:30:00Z',
            },
        ]

        const { result } = renderHook(() =>
            useTicketThreadMessages({
                ticketId: 123,
                pendingMessages,
            }),
        )

        expect(result.current.messages).toEqual([])
        expect(result.current.activePendingMessages).toEqual([])
    })
})
