import { TicketChannel } from 'business/types/ticket'

import type { TicketElement } from '../../types'
import { bareMessageTransformer } from '../bareMessageTransformer'

describe('bareMessageTransformer', () => {
    it('should not transform non-message elements', () => {
        const elements = [{ type: 'event' }] as TicketElement[]

        const result = bareMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform messages form non-grouping channels', () => {
        const elements = [
            { type: 'message', data: { channel: TicketChannel.Email } },
        ] as TicketElement[]

        const result = bareMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform a single message from a grouping channel', () => {
        const elements = [
            { type: 'message', data: { channel: TicketChannel.Chat } },
        ] as TicketElement[]

        const result = bareMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform messages from grouping channel if events are in between them', () => {
        const elements = [
            { type: 'message', data: { channel: TicketChannel.Chat } },
            { type: 'event' },
            { type: 'message', data: { channel: TicketChannel.Chat } },
        ] as TicketElement[]

        const result = bareMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform messages if they are not from the same sender', () => {
        const elements = [
            {
                type: 'message',
                data: { channel: TicketChannel.Chat, sender: { id: 1 } },
            },
            {
                type: 'message',
                data: { channel: TicketChannel.Chat, sender: { id: 2 } },
            },
        ] as TicketElement[]

        const result = bareMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform messages if they are not from the same channel', () => {
        const elements = [
            {
                type: 'message',
                data: { channel: TicketChannel.Chat, sender: { id: 1 } },
            },
            {
                type: 'message',
                data: {
                    channel: TicketChannel.FacebookMessenger,
                    sender: { id: 1 },
                },
            },
        ] as TicketElement[]

        const result = bareMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform messages if they do not have the same public value', () => {
        const elements = [
            {
                type: 'message',
                data: {
                    channel: TicketChannel.Chat,
                    public: true,
                    sender: { id: 1 },
                },
            },
            {
                type: 'message',
                data: {
                    channel: TicketChannel.Chat,
                    public: false,
                    sender: { id: 1 },
                },
            },
        ] as TicketElement[]

        const result = bareMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform messages if they do not have the same from_agent value', () => {
        const elements = [
            {
                type: 'message',
                data: {
                    channel: TicketChannel.Chat,
                    from_agent: true,
                    public: true,
                    sender: { id: 1 },
                },
            },
            {
                type: 'message',
                data: {
                    channel: TicketChannel.Chat,
                    from_agent: false,
                    public: true,
                    sender: { id: 1 },
                },
            },
        ] as TicketElement[]

        const result = bareMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should not transform messages if they are not within 5 minutes of the first message in the group', () => {
        const elements = [
            {
                type: 'message',
                data: {
                    channel: TicketChannel.Chat,
                    created_datetime: '2025-05-19T17:00:00',
                    from_agent: true,
                    public: true,
                    sender: { id: 1 },
                },
            },
            {
                type: 'message',
                data: {
                    channel: TicketChannel.Chat,
                    created_datetime: '2025-05-19T17:06:00',
                    from_agent: true,
                    public: true,
                    sender: { id: 1 },
                },
            },
        ] as TicketElement[]

        const result = bareMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should transform messages into bare messages if all conditions are met', () => {
        const elements = [
            {
                type: 'message',
                data: {
                    channel: TicketChannel.Chat,
                    created_datetime: '2025-05-19T17:00:00',
                    from_agent: true,
                    public: true,
                    sender: { id: 1 },
                },
            },
            {
                type: 'message',
                data: {
                    channel: TicketChannel.Chat,
                    created_datetime: '2025-05-19T17:03:00',
                    from_agent: true,
                    public: true,
                    sender: { id: 1 },
                },
            },
        ] as TicketElement[]

        const result = bareMessageTransformer(elements)
        expect(result).toEqual([
            elements[0],
            {
                type: 'bare-message',
                data: { isBare: true, message: elements[1].data },
            },
        ])
    })
})
