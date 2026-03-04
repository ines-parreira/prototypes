import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListMessagesHandler,
    mockListMessagesResponse,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { TicketThreadItemTag } from '../../types'
import type { TicketThreadMessageItem } from '../types'
import { useTicketThreadMessages } from '../useTicketThreadMessages'

function createMessage(overrides?: Record<string, unknown>) {
    return mockTicketMessage({
        channel: 'email',
        from_agent: false,
        via: 'email',
        created_datetime: '2024-03-21T11:00:00Z',
        ...overrides,
    } as any)
}

function getTicketMessagesHandler(messages: unknown[]) {
    return mockListMessagesHandler(async () =>
        HttpResponse.json(
            mockListMessagesResponse({
                data: messages as any[],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                    total_resources: messages.length,
                },
            }),
        ),
    )
}

function getMessageIds(items: TicketThreadMessageItem[]): number[] {
    return items.flatMap((item) => {
        if (item._tag === TicketThreadItemTag.Messages.GroupedMessages) {
            return item.data.map((message) => message.data.id as number)
        }

        return [item.data.id as number]
    })
}

describe('useTicketThreadMessages', () => {
    it('keeps legacy ordering between persisted/failed and active pending buckets', async () => {
        const mockListTicketMessages = getTicketMessagesHandler([
            createMessage({
                id: 10,
                created_datetime: '2024-03-21T10:00:00Z',
            }),
            createMessage({
                id: 20,
                created_datetime: '2024-03-21T10:01:00Z',
                meta: { hidden: true },
            }),
            createMessage({
                id: 30,
                created_datetime: '2024-03-21T10:02:00Z',
                meta: { type: 'signal' },
            }),
        ])
        server.use(mockListTicketMessages.handler)

        const pendingMessages: unknown[] = [
            createMessage({
                id: 40,
                created_datetime: '2024-03-21T10:20:00Z',
                failed_datetime: '2024-03-21T10:21:00Z',
            }),
            createMessage({
                id: 50,
                created_datetime: '2024-03-21T10:30:00Z',
                failed_datetime: null,
            }),
        ]

        const { result } = renderHook(() =>
            useTicketThreadMessages({
                ticketId: 123,
                pendingMessages,
            }),
        )

        await waitFor(() => {
            expect(getMessageIds(result.current.messages)).toEqual([10, 40])
        })
        expect(getMessageIds(result.current.activePendingMessages)).toEqual([
            50,
        ])
    })

    it('ignores non-ticket pending payloads', async () => {
        server.use(getTicketMessagesHandler([]).handler)

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

        await waitFor(() => {
            expect(result.current.messages).toEqual([])
        })
        expect(result.current.activePendingMessages).toEqual([])
    })
})
