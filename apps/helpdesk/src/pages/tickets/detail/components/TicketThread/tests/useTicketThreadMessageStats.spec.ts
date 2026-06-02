import { renderHook } from '@repo/testing'
import { TicketThreadItemTag } from '@repo/ticket-thread'
import type { TicketThreadItemType } from '@repo/ticket-thread'

import { useTicketThreadMessageStats } from '../useTicketThreadMessageStats'

const msg = (
    tag: string,
    fromAgent: boolean,
    datetime = '2024-01-01T10:00:00Z',
) =>
    ({
        _tag: tag,
        datetime,
        data: { from_agent: fromAgent },
    }) as unknown as TicketThreadItemType

const grouped = (
    msgs: Array<{
        _tag: string
        datetime: string
        data: { from_agent: boolean }
    }>,
    datetime = '2024-01-01T10:00:00Z',
) =>
    ({
        _tag: TicketThreadItemTag.Messages.GroupedMessages,
        datetime,
        data: msgs,
    }) as unknown as TicketThreadItemType

describe('useTicketThreadMessageStats', () => {
    it('returns zero counts for an empty thread', () => {
        const { result } = renderHook(() => useTicketThreadMessageStats([]))

        expect(result.current.messageCount).toBe(0)
        expect(result.current.messagesAfterHandover).toBe(0)
        expect(result.current.hasHandoverMessage).toBe(false)
        expect(result.current.hasInternalMessages).toBe(false)
        expect(result.current.hasExternalMessages).toBe(false)
        expect(result.current.latestMessageDatetime).toBeNull()
    })

    it('counts messages from agents and bots as internal', () => {
        const items = [
            msg(
                TicketThreadItemTag.Messages.Message,
                true,
                '2024-01-01T10:00:00Z',
            ),
            msg(
                TicketThreadItemTag.Messages.AiAgentMessage,
                true,
                '2024-01-01T11:00:00Z',
            ),
        ]

        const { result } = renderHook(() => useTicketThreadMessageStats(items))

        expect(result.current.messageCount).toBe(2)
        expect(result.current.hasInternalMessages).toBe(true)
        expect(result.current.hasExternalMessages).toBe(false)
    })

    it('counts messages from customers as external', () => {
        const items = [
            msg(
                TicketThreadItemTag.Messages.Message,
                false,
                '2024-01-01T10:00:00Z',
            ),
        ]

        const { result } = renderHook(() => useTicketThreadMessageStats(items))

        expect(result.current.messageCount).toBe(1)
        expect(result.current.hasExternalMessages).toBe(true)
        expect(result.current.hasInternalMessages).toBe(false)
    })

    it('ignores non-message items such as events and rule suggestions', () => {
        const items = [
            {
                _tag: TicketThreadItemTag.Events.TicketEvent,
                datetime: '2024-01-01T10:00:00Z',
            } as unknown as TicketThreadItemType,
            {
                _tag: TicketThreadItemTag.RuleSuggestion,
                datetime: '2024-01-01T11:00:00Z',
            } as unknown as TicketThreadItemType,
        ]

        const { result } = renderHook(() => useTicketThreadMessageStats(items))

        expect(result.current.messageCount).toBe(0)
        expect(result.current.latestMessageDatetime).toBeNull()
    })

    it('counts messages inside grouped containers and classifies them correctly', () => {
        const items = [
            grouped([
                {
                    _tag: TicketThreadItemTag.Messages.Message,
                    datetime: '2024-01-01T10:00:00Z',
                    data: { from_agent: false },
                },
                {
                    _tag: TicketThreadItemTag.Messages.Message,
                    datetime: '2024-01-01T11:00:00Z',
                    data: { from_agent: true },
                },
            ]),
        ]

        const { result } = renderHook(() => useTicketThreadMessageStats(items))

        expect(result.current.messageCount).toBe(2)
        expect(result.current.hasExternalMessages).toBe(true)
        expect(result.current.hasInternalMessages).toBe(true)
    })

    it('detects the handover message and counts messages that come after it', () => {
        const items = [
            msg(
                TicketThreadItemTag.Messages.Message,
                false,
                '2024-01-01T09:00:00Z',
            ),
            msg(
                TicketThreadItemTag.Messages.AiAgentHandoverMessage,
                true,
                '2024-01-01T10:00:00Z',
            ),
            msg(
                TicketThreadItemTag.Messages.Message,
                false,
                '2024-01-01T11:00:00Z',
            ),
            msg(
                TicketThreadItemTag.Messages.Message,
                true,
                '2024-01-01T12:00:00Z',
            ),
        ]

        const { result } = renderHook(() => useTicketThreadMessageStats(items))

        expect(result.current.hasHandoverMessage).toBe(true)
        expect(result.current.messageCount).toBe(4)
        expect(result.current.messagesAfterHandover).toBe(2)
    })

    it('does not count messages before the handover in messagesAfterHandover', () => {
        const items = [
            msg(
                TicketThreadItemTag.Messages.Message,
                false,
                '2024-01-01T08:00:00Z',
            ),
            msg(
                TicketThreadItemTag.Messages.Message,
                false,
                '2024-01-01T09:00:00Z',
            ),
            msg(
                TicketThreadItemTag.Messages.AiAgentHandoverMessage,
                true,
                '2024-01-01T10:00:00Z',
            ),
        ]

        const { result } = renderHook(() => useTicketThreadMessageStats(items))

        expect(result.current.messagesAfterHandover).toBe(0)
        expect(result.current.messageCount).toBe(3)
    })

    it('tracks the latest message datetime across all message types', () => {
        const items = [
            msg(
                TicketThreadItemTag.Messages.Message,
                false,
                '2024-01-01T08:00:00Z',
            ),
            msg(
                TicketThreadItemTag.Messages.Message,
                true,
                '2024-01-01T12:00:00Z',
            ),
            msg(
                TicketThreadItemTag.Messages.AiAgentMessage,
                true,
                '2024-01-01T06:00:00Z',
            ),
        ]

        const { result } = renderHook(() => useTicketThreadMessageStats(items))

        expect(result.current.latestMessageDatetime).toBe(
            '2024-01-01T12:00:00Z',
        )
    })

    it('includes the handover message datetime in the latest datetime comparison', () => {
        const items = [
            msg(
                TicketThreadItemTag.Messages.Message,
                false,
                '2024-01-01T10:00:00Z',
            ),
            msg(
                TicketThreadItemTag.Messages.AiAgentHandoverMessage,
                true,
                '2024-01-01T15:00:00Z',
            ),
        ]

        const { result } = renderHook(() => useTicketThreadMessageStats(items))

        expect(result.current.latestMessageDatetime).toBe(
            '2024-01-01T15:00:00Z',
        )
    })

    it('tracks the latest datetime inside grouped message containers', () => {
        const items = [
            grouped([
                {
                    _tag: TicketThreadItemTag.Messages.Message,
                    datetime: '2024-01-01T09:00:00Z',
                    data: { from_agent: false },
                },
                {
                    _tag: TicketThreadItemTag.Messages.Message,
                    datetime: '2024-01-01T14:00:00Z',
                    data: { from_agent: true },
                },
            ]),
        ]

        const { result } = renderHook(() => useTicketThreadMessageStats(items))

        expect(result.current.latestMessageDatetime).toBe(
            '2024-01-01T14:00:00Z',
        )
    })
})
