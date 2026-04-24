import {
    mockTicketMessage,
    mockTicketMessageUserOrCustomer,
} from '@gorgias/helpdesk-mocks'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { TicketThreadItemTag } from '../../types'
import { extractHttpActionsFromMessages } from '../httpActions'
import type { TicketMessageSchema } from '../schemas'
import type {
    TicketThreadMessageData,
    TicketThreadMessageItem,
    TicketThreadRegularMessageItem,
} from '../types'

type CreateMessageOverrides = Omit<
    Partial<TicketMessage>,
    'sender' | 'channel'
> & {
    sender?: Partial<TicketMessage['sender']>
    channel?: TicketMessageSchema['channel']
}

function createSingleMessageItem(
    overrides: CreateMessageOverrides = {},
): TicketThreadRegularMessageItem {
    const {
        sender: senderOverride,
        channel = 'email' as const,
        ...rest
    } = overrides
    const data: TicketThreadMessageData = {
        ...mockTicketMessage({
            id: 1,
            created_datetime: '2024-03-21T11:00:00Z',
            integration_id: null,
            sender: mockTicketMessageUserOrCustomer({
                id: 42,
                ...senderOverride,
            }),
            ...rest,
        }),
        channel,
    }
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        datetime: data.created_datetime,
        data,
    }
}

describe('extractHttpActionsFromMessages', () => {
    it('returns empty array for empty input', () => {
        expect(extractHttpActionsFromMessages([])).toEqual([])
    })

    it('returns empty array when message has no actions field', () => {
        expect(
            extractHttpActionsFromMessages([createSingleMessageItem()]),
        ).toEqual([])
    })

    it('returns empty array when actions contains no http actions', () => {
        expect(
            extractHttpActionsFromMessages([
                createSingleMessageItem({
                    actions: [
                        { name: 'setStatus', arguments: { status: 'closed' } },
                        { name: 'addTag', arguments: { tag: 'vip' } },
                    ],
                }),
            ]),
        ).toEqual([])
    })

    it('extracts an http action and maps core fields correctly', () => {
        const result = extractHttpActionsFromMessages([
            createSingleMessageItem({
                sender: { id: 42 },
                integration_id: 10,
                actions: [
                    {
                        name: 'http',
                        title: 'My Action',
                        status: 'success',
                        arguments: {
                            url: 'https://example.com',
                            headers: { 'X-Key': 'abc' },
                            params: { page: '1' },
                            content_type: 'application/json',
                            json: { order: 1 },
                        },
                    },
                ],
            }),
        ])

        expect(result).toHaveLength(1)
        const item = result[0]
        expect(item._tag).toBe(TicketThreadItemTag.Events.ActionExecutedEvent)
        expect(item.data.data.action_name).toBe('customHttpAction')
        expect(item.data.data.action_label).toBe('My Action')
        expect(item.data.data.status).toBe('success')
        expect(item.data.data.integration_id).toBe(10)
        expect(item.data.user_id).toBe(42)
        expect(item.data.data.payload).toEqual({
            url: 'https://example.com',
            headers: { 'X-Key': 'abc' },
            params: { page: '1' },
            content_type: 'application/json',
            json: { order: 1 },
            form: undefined,
            response: undefined,
        })
    })

    it('maps response fields from action.response', () => {
        const result = extractHttpActionsFromMessages([
            createSingleMessageItem({
                actions: [
                    {
                        name: 'http',
                        status: 'error',
                        arguments: { url: 'https://example.com' },
                        response: {
                            status_code: 500,
                            response: '{"error":"fail"}',
                            msg: 'Action failed',
                        },
                    },
                ],
            }),
        ])

        expect(result[0].data.data.msg).toBe('Action failed')
        expect(result[0].data.data.payload.response).toEqual({
            status_code: 500,
            body: '{"error":"fail"}',
        })
    })

    it('sets response to undefined when action has no response object', () => {
        const result = extractHttpActionsFromMessages([
            createSingleMessageItem({
                actions: [
                    { name: 'http', arguments: { url: 'https://example.com' } },
                ],
            }),
        ])

        expect(result[0].data.data.payload.response).toBeUndefined()
    })

    it('sets action_label to null when title is absent', () => {
        const result = extractHttpActionsFromMessages([
            createSingleMessageItem({
                actions: [
                    { name: 'http', arguments: { url: 'https://example.com' } },
                ],
            }),
        ])

        expect(result[0].data.data.action_label).toBeNull()
    })

    it('skips non-http actions and only returns http ones from a mixed array', () => {
        const result = extractHttpActionsFromMessages([
            createSingleMessageItem({
                actions: [
                    { name: 'setStatus', arguments: { status: 'closed' } },
                    {
                        name: 'http',
                        title: 'First',
                        arguments: { url: 'https://a.com' },
                    },
                    { name: 'addTag', arguments: { tag: 'vip' } },
                    {
                        name: 'http',
                        title: 'Second',
                        arguments: { url: 'https://b.com' },
                    },
                ],
            }),
        ])

        expect(result).toHaveLength(2)
        expect(result[0].data.data.action_label).toBe('First')
        expect(result[1].data.data.action_label).toBe('Second')
    })

    it('extracts http actions from grouped message items', () => {
        const groupedItem: TicketThreadMessageItem = {
            _tag: TicketThreadItemTag.Messages.GroupedMessages,
            datetime: '2024-03-21T11:00:00Z',
            data: [
                createSingleMessageItem({
                    actions: [
                        {
                            name: 'http',
                            title: 'Action A',
                            arguments: { url: 'https://a.com' },
                        },
                    ],
                }),
                createSingleMessageItem({
                    actions: [
                        {
                            name: 'http',
                            title: 'Action B',
                            arguments: { url: 'https://b.com' },
                        },
                    ],
                }),
            ],
        }

        const result = extractHttpActionsFromMessages([groupedItem])

        expect(result).toHaveLength(2)
        expect(result[0].data.data.action_label).toBe('Action A')
        expect(result[1].data.data.action_label).toBe('Action B')
    })
})
