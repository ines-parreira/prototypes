import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetTicketHandler,
    mockListMessagesHandler,
    mockListMessagesResponse,
    mockTicket,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import type { TicketThreadItem } from '../../types'
import { TicketThreadItemTag } from '../../types'
import { useRuleSuggestion } from '../useRuleSuggestion'

function getRuleSuggestionTicket() {
    return mockTicket({
        id: 123,
        meta: {
            rule_suggestion: {
                actions: [
                    {
                        name: 'setStatus',
                        args: { status: 'open' },
                    },
                ],
            },
        },
    } as any)
}

function getTicketMessagesHandler(overrides?: {
    messages?: unknown[]
    delayMs?: number
}) {
    const messages = overrides?.messages ?? []
    const delayMs = overrides?.delayMs ?? 0

    return mockListMessagesHandler(async () => {
        if (delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs))
        }

        return HttpResponse.json(
            mockListMessagesResponse({
                data: messages as any[],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                    total_resources: messages.length,
                },
            }),
        )
    })
}

function getMessageItem({
    fromAgent,
    via,
}: {
    fromAgent: boolean
    via: string
}): TicketThreadItem {
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        datetime: '2024-03-21T11:00:00Z',
        data: {
            from_agent: fromAgent,
            via,
        },
    } as unknown as TicketThreadItem
}

function getGroupedMessagesItem(
    messages: Array<{ fromAgent: boolean; via: string }>,
): TicketThreadItem {
    return {
        _tag: TicketThreadItemTag.Messages.GroupedMessages,
        datetime: '2024-03-21T11:00:00Z',
        data: messages.map((message, index) => ({
            _tag: TicketThreadItemTag.Messages.Message,
            datetime: `2024-03-21T11:00:0${index}Z`,
            data: {
                from_agent: message.fromAgent,
                via: message.via,
            },
        })),
    } as unknown as TicketThreadItem
}

describe('useRuleSuggestion', () => {
    it('inserts a rule suggestion when legacy filters allow rendering', async () => {
        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(getRuleSuggestionTicket()),
        )
        const mockListTicketMessages = getTicketMessagesHandler()

        server.use(mockGetTicket.handler, mockListTicketMessages.handler)

        const { result } = renderHook(() =>
            useRuleSuggestion({ ticketId: 123 }),
        )

        await waitFor(() => {
            expect(result.current.insertRuleSuggestion([])).toHaveLength(1)
        })
        expect(result.current.insertRuleSuggestion([])[0]).toMatchObject({
            _tag: TicketThreadItemTag.RuleSuggestion,
        })
    })

    it('does not insert a rule suggestion when demo display is disabled', async () => {
        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(getRuleSuggestionTicket()),
        )
        const mockListTicketMessages = getTicketMessagesHandler()
        const waitForGetTicketRequest = mockGetTicket.waitForRequest(server)

        server.use(mockGetTicket.handler, mockListTicketMessages.handler)

        const { result } = renderHook(
            () => useRuleSuggestion({ ticketId: 123 }),
            {
                currentTicketRuleSuggestionData: {
                    shouldDisplayDemoSuggestion: false,
                },
            },
        )

        await waitForGetTicketRequest(() => undefined)

        expect(result.current.insertRuleSuggestion([])).toEqual([])
    })

    it('does not insert a rule suggestion when a message already has rule_suggestion_slug', async () => {
        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(getRuleSuggestionTicket()),
        )
        const mockListTicketMessages = getTicketMessagesHandler({
            messages: [
                mockTicketMessage({
                    id: 999,
                    created_datetime: '2024-03-21T11:00:00Z',
                    meta: {
                        rule_suggestion_slug: 'existing-suggestion',
                    },
                } as any),
            ],
        })
        const waitForListMessagesRequest =
            mockListTicketMessages.waitForRequest(server)

        server.use(mockGetTicket.handler, mockListTicketMessages.handler)

        const { result } = renderHook(() =>
            useRuleSuggestion({ ticketId: 123 }),
        )

        await waitForListMessagesRequest(() => undefined)

        expect(result.current.insertRuleSuggestion([])).toEqual([])
    })

    it('inserts suggestion before first agent-authored non-rule single message', async () => {
        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(getRuleSuggestionTicket()),
        )
        const mockListTicketMessages = getTicketMessagesHandler()

        server.use(mockGetTicket.handler, mockListTicketMessages.handler)

        const firstCustomerMessage = getMessageItem({
            fromAgent: false,
            via: 'api',
        })
        const firstAgentMessage = getMessageItem({
            fromAgent: true,
            via: 'email',
        })
        const items = [firstCustomerMessage, firstAgentMessage]

        const { result } = renderHook(() =>
            useRuleSuggestion({ ticketId: 123 }),
        )

        await waitFor(() => {
            expect(result.current.insertRuleSuggestion(items)).toHaveLength(3)
        })
        expect(result.current.insertRuleSuggestion(items)[1]).toMatchObject({
            _tag: TicketThreadItemTag.RuleSuggestion,
        })
    })

    it('uses grouped messages metadata to place suggestion before first non-rule agent group', async () => {
        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(getRuleSuggestionTicket()),
        )
        const mockListTicketMessages = getTicketMessagesHandler()

        server.use(mockGetTicket.handler, mockListTicketMessages.handler)

        const customerMessage = getMessageItem({
            fromAgent: false,
            via: 'api',
        })
        const groupedAgentMessages = getGroupedMessagesItem([
            { fromAgent: true, via: 'email' },
        ])
        const items = [customerMessage, groupedAgentMessages]

        const { result } = renderHook(() =>
            useRuleSuggestion({ ticketId: 123 }),
        )

        await waitFor(() => {
            expect(result.current.insertRuleSuggestion(items)).toHaveLength(3)
        })
        expect(result.current.insertRuleSuggestion(items)[1]).toMatchObject({
            _tag: TicketThreadItemTag.RuleSuggestion,
        })
    })

    it('appends suggestion at the end when no eligible insertion point is found', async () => {
        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(getRuleSuggestionTicket()),
        )
        const mockListTicketMessages = getTicketMessagesHandler()

        server.use(mockGetTicket.handler, mockListTicketMessages.handler)

        const groupedWithoutMessages = getGroupedMessagesItem([])
        const ruleAuthoredMessage = getMessageItem({
            fromAgent: true,
            via: 'rule',
        })
        const items = [groupedWithoutMessages, ruleAuthoredMessage]

        const { result } = renderHook(() =>
            useRuleSuggestion({ ticketId: 123 }),
        )

        await waitFor(() => {
            expect(result.current.insertRuleSuggestion(items)).toHaveLength(3)
        })
        expect(result.current.insertRuleSuggestion(items).at(-1)).toMatchObject(
            {
                _tag: TicketThreadItemTag.RuleSuggestion,
            },
        )
    })

    it('does not insert suggestion while message list is unresolved', async () => {
        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(getRuleSuggestionTicket()),
        )
        const delayedMessages = getTicketMessagesHandler({ delayMs: 200 })

        server.use(mockGetTicket.handler, delayedMessages.handler)

        const baseItems = [getMessageItem({ fromAgent: false, via: 'api' })]

        const { result } = renderHook(() =>
            useRuleSuggestion({ ticketId: 123 }),
        )
        const inserted = result.current.insertRuleSuggestion(baseItems)

        expect(inserted).toEqual(baseItems)
    })

    it('requests ticket data for the provided ticket id', async () => {
        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(getRuleSuggestionTicket()),
        )
        const mockListTicketMessages = getTicketMessagesHandler()
        const waitForGetTicketRequest = mockGetTicket.waitForRequest(server)

        server.use(mockGetTicket.handler, mockListTicketMessages.handler)

        renderHook(() => useRuleSuggestion({ ticketId: 123 }))

        await waitForGetTicketRequest((request) => {
            const url = new URL(request.url)
            expect(url.pathname).toContain('/tickets/123')
        })
    })

    it.skip('does not insert a rule suggestion when pending/failed/active pending messages already have rule_suggestion_slug', () => {
        // TODO: implement when pending/failed/active-pending messages are
        // explicitly wired into the rule-suggestion insertion flow.
        // Legacy parity target: apps/helpdesk/src/state/ticket/selectors.ts#getBody
    })
})
