import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetTicketHandler,
    mockListTicketTagsHandler,
    mockListTicketTagsResponse,
    mockTicket,
    mockTicketMessage,
    mockTicketMessageUserOrCustomer,
} from '@gorgias/helpdesk-mocks'
import { TicketStatus } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { TicketThreadAiAgentPseudoEventAction } from '../ai-agent-pseudo-events/types'
import { useContactReasonPrediction } from '../contact-reason-prediction/useContactReasonPrediction'
import type { TicketThreadActionExecutedEventItem } from '../events/types'
import { useTicketThreadEvents } from '../events/useTicketThreadEvents'
import { AI_AGENT_BOT_EMAILS } from '../messages/constants'
import type {
    TicketThreadMessageData,
    TicketThreadRegularMessageItem,
} from '../messages/types'
import { useTicketThreadMessages } from '../messages/useTicketThreadMessages'
import { useRuleSuggestion } from '../rules-suggestions/useRuleSuggestion'
import { useTicketThreadSatisfactionSurveys } from '../satisfaction-survey/useTicketThreadSatisfactionSurveys'
import { useTicketThreadShoppingAssistantEvents } from '../shopping-assistant-events/useTicketThreadShoppingAssistantEvents'
import { TicketThreadItemTag } from '../types'
import { useTicketThread } from '../useTicketThread'
import { useTicketThreadVoiceCalls } from '../voice-calls/useTicketThreadVoiceCalls'

vi.mock('../messages/useTicketThreadMessages', () => ({
    useTicketThreadMessages: vi.fn(),
}))
vi.mock('../events/useTicketThreadEvents', () => ({
    useTicketThreadEvents: vi.fn(),
}))
vi.mock('../voice-calls/useTicketThreadVoiceCalls', () => ({
    useTicketThreadVoiceCalls: vi.fn(),
}))
vi.mock('../satisfaction-survey/useTicketThreadSatisfactionSurveys', () => ({
    useTicketThreadSatisfactionSurveys: vi.fn(),
}))
vi.mock(
    '../shopping-assistant-events/useTicketThreadShoppingAssistantEvents',
    () => ({
        useTicketThreadShoppingAssistantEvents: vi.fn(),
    }),
)
vi.mock('../rules-suggestions/useRuleSuggestion', () => ({
    useRuleSuggestion: vi.fn(),
}))
vi.mock('../contact-reason-prediction/useContactReasonPrediction', () => ({
    useContactReasonPrediction: vi.fn(),
}))

const mockUseTicketThreadMessages = vi.mocked(useTicketThreadMessages)
const mockUseTicketThreadEvents = vi.mocked(useTicketThreadEvents)
const mockUseTicketThreadVoiceCalls = vi.mocked(useTicketThreadVoiceCalls)
const mockUseTicketThreadSatisfactionSurveys = vi.mocked(
    useTicketThreadSatisfactionSurveys,
)
const mockUseTicketThreadShoppingAssistantEvents = vi.mocked(
    useTicketThreadShoppingAssistantEvents,
)
const mockUseRuleSuggestion = vi.mocked(useRuleSuggestion)
const mockUseContactReasonPrediction = vi.mocked(useContactReasonPrediction)

function getTicketIdFromRequest(request: Request): number {
    return Number(new URL(request.url).pathname.split('/').at(-2))
}

function createMessageWithHttpAction(
    datetime: string,
    httpAction: Record<string, unknown> = {},
): TicketThreadRegularMessageItem {
    const base = mockTicketMessage({
        id: 1,
        created_datetime: datetime,
        integration_id: null,
    })
    const data: TicketThreadMessageData = {
        ...base,
        channel: 'email' as const,
        sender: mockTicketMessageUserOrCustomer({ ...base.sender, id: 42 }),
        actions: [{ name: 'http', ...httpAction }],
    }
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        datetime,
        data,
    }
}

function createAiAgentMessageItem(
    overrides: Record<string, unknown> = {},
): any {
    const data = mockTicketMessage({
        id: 42,
        created_datetime: '2024-03-21T11:01:00Z',
        channel: 'chat',
        public: true,
        from_agent: true,
        via: 'api',
        sender: {
            id: 2,
            name: 'AI Agent',
            firstname: 'AI',
            lastname: 'Agent',
            email: AI_AGENT_BOT_EMAILS[0],
            meta: null,
        },
        ...overrides,
    })

    return {
        _tag: TicketThreadItemTag.Messages.AiAgentMessage,
        data,
        datetime: data.created_datetime,
    }
}

describe('useTicketThread', () => {
    beforeEach(() => {
        server.use(
            mockGetTicketHandler(async () =>
                HttpResponse.json(
                    mockTicket({
                        id: 7,
                    }),
                ),
            ).handler,
        )
        mockUseTicketThreadMessages.mockReturnValue({
            messages: [],
            activePendingMessages: [],
            isLoading: false,
        })
        mockUseTicketThreadEvents.mockReturnValue({
            events: [],
            hasSatisfactionSurveyRespondedEvent: false,
        })
        mockUseTicketThreadVoiceCalls.mockReturnValue([])
        mockUseTicketThreadSatisfactionSurveys.mockReturnValue([])
        mockUseTicketThreadShoppingAssistantEvents.mockReturnValue({
            items: [],
        })
        mockUseRuleSuggestion.mockReturnValue({
            insertRuleSuggestion: (items) => items,
        })
        mockUseContactReasonPrediction.mockReturnValue({
            insertContactReasonPrediction: (items) => items,
        })
    })

    it('sorts core items, appends active pending, then applies insertion hooks in order', () => {
        const messageEarly = {
            _tag: 'message-early',
            datetime: '2024-03-21T11:01:00Z',
        }
        const messageLate = {
            _tag: 'message-late',
            datetime: '2024-03-21T11:03:00Z',
        }
        const eventMid = {
            _tag: 'event-mid',
            datetime: '2024-03-21T11:02:00Z',
        }
        const voiceLate = {
            _tag: 'voice-late',
            datetime: '2024-03-21T11:04:00Z',
        }
        const influencedOrderMid = {
            _tag: TicketThreadItemTag.ShoppingAssistant.InfluencedOrder,
            datetime: '2024-03-21T11:02:15Z',
        }
        const surveyMidLate = {
            _tag: 'survey-mid-late',
            datetime: '2024-03-21T11:02:30Z',
        }
        const activePendingOld = {
            _tag: 'active-pending-old',
            datetime: '2024-03-21T11:00:00Z',
        }
        const ruleMarker = { _tag: 'rule-marker' }
        const contactMarker = { _tag: 'contact-marker' }

        mockUseTicketThreadMessages.mockReturnValue({
            messages: [messageLate, messageEarly] as any,
            activePendingMessages: [activePendingOld] as any,
            isLoading: false,
        })
        mockUseTicketThreadEvents.mockReturnValue({
            events: [eventMid] as any,
            hasSatisfactionSurveyRespondedEvent: false,
        })
        mockUseTicketThreadVoiceCalls.mockReturnValue([voiceLate] as any)
        mockUseTicketThreadShoppingAssistantEvents.mockReturnValue({
            items: [influencedOrderMid] as any,
        })
        mockUseTicketThreadSatisfactionSurveys.mockReturnValue([
            surveyMidLate,
        ] as any)

        const insertRuleSuggestion = vi.fn((items: any[]) => [
            ...items,
            ruleMarker,
        ])
        const insertContactReasonPrediction = vi.fn((items: any[]) => [
            ...items,
            contactMarker,
        ])
        mockUseRuleSuggestion.mockReturnValue({ insertRuleSuggestion })
        mockUseContactReasonPrediction.mockReturnValue({
            insertContactReasonPrediction,
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: true }),
        )

        const expectedBeforeInsertions = [
            messageEarly,
            eventMid,
            influencedOrderMid,
            surveyMidLate,
            messageLate,
            voiceLate,
            activePendingOld,
        ]
        expect(insertRuleSuggestion).toHaveBeenCalledWith(
            expectedBeforeInsertions,
        )
        expect(insertContactReasonPrediction).toHaveBeenCalledWith([
            ...expectedBeforeInsertions,
            ruleMarker,
        ])

        // Legacy parity: active pending messages are intentionally appended after
        // sorting persisted/messages/events/voice/satisfaction buckets.
        expect(result.current.ticketThreadItems).toEqual([
            ...expectedBeforeInsertions,
            ruleMarker,
            contactMarker,
        ])
    })

    it('keeps events in sorted core items when showTicketEvents is false', () => {
        const message = {
            _tag: 'message',
            datetime: '2024-03-21T11:01:00Z',
        }
        const event = {
            _tag: 'event',
            datetime: '2024-03-21T11:00:00Z',
        }

        mockUseTicketThreadMessages.mockReturnValue({
            messages: [message] as any,
            activePendingMessages: [],
            isLoading: false,
        })
        mockUseTicketThreadEvents.mockReturnValue({
            events: [event] as any,
            hasSatisfactionSurveyRespondedEvent: false,
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: false }),
        )

        expect(result.current.ticketThreadItems).toEqual([event, message])
    })

    it('keeps influenced order items visible when showTicketEvents is false', () => {
        const message = {
            _tag: 'message',
            datetime: '2024-03-21T11:01:00Z',
        }
        const event = {
            _tag: 'event',
            datetime: '2024-03-21T11:00:00Z',
        }
        const influencedOrder = {
            _tag: TicketThreadItemTag.ShoppingAssistant.InfluencedOrder,
            datetime: '2024-03-21T11:00:30Z',
        }

        mockUseTicketThreadMessages.mockReturnValue({
            messages: [message] as any,
            activePendingMessages: [],
            isLoading: false,
        })
        mockUseTicketThreadEvents.mockReturnValue({
            events: [event] as any,
            hasSatisfactionSurveyRespondedEvent: false,
        })
        mockUseTicketThreadShoppingAssistantEvents.mockReturnValue({
            items: [influencedOrder] as any,
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: false }),
        )

        expect(result.current.ticketThreadItems).toEqual([
            event,
            influencedOrder,
            message,
        ])
    })

    it('applies AI pseudo-event enrichment only when ticket events are hidden', async () => {
        const message = createAiAgentMessageItem({
            actions: [
                {
                    name: 'setStatus',
                    arguments: { status: TicketStatus.Closed },
                },
            ],
        })
        const onRequest = vi.fn()

        mockUseTicketThreadMessages.mockReturnValue({
            messages: [message],
            activePendingMessages: [],
            isLoading: false,
        })
        server.use(
            mockListTicketTagsHandler(async ({ request }) => {
                onRequest({ ticketId: getTicketIdFromRequest(request) })

                return HttpResponse.json(
                    mockListTicketTagsResponse({
                        data: [],
                    }),
                )
            }).handler,
        )

        const hiddenResult = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: false }),
        )

        await waitFor(() => {
            expect(hiddenResult.result.current.ticketThreadItems).toEqual([
                {
                    ...message,
                    data: {
                        ...message.data,
                        decorations: {
                            aiAgentPseudoEvent: {
                                action: TicketThreadAiAgentPseudoEventAction.Close,
                                tags: [],
                            },
                        },
                    },
                },
            ])
        })
        expect(onRequest).toHaveBeenCalledTimes(1)
        expect(onRequest).toHaveBeenCalledWith({ ticketId: 7 })

        const visibleResult = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: true }),
        )

        expect(visibleResult.result.current.ticketThreadItems).toEqual([
            message,
        ])
    })

    it('merges consecutive event items in the final ticket thread output', () => {
        const firstEvent = {
            _tag: TicketThreadItemTag.Events.TicketEvent,
            datetime: '2024-03-21T11:01:00Z',
            data: { id: 1 },
        }
        const secondEvent = {
            _tag: TicketThreadItemTag.Events.PhoneEvent,
            datetime: '2024-03-21T11:02:00Z',
            data: { id: 2 },
        }

        mockUseTicketThreadEvents.mockReturnValue({
            events: [firstEvent, secondEvent] as any,
            hasSatisfactionSurveyRespondedEvent: false,
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: true }),
        )

        expect(result.current.ticketThreadItems).toEqual([
            {
                _tag: TicketThreadItemTag.Events.GroupedEvents,
                data: [firstEvent, secondEvent],
                datetime: firstEvent.datetime,
            },
        ])
    })

    it('deduplicates customHttpAction events against message-extracted HTTP actions', () => {
        const datetime = '2024-03-21T11:00:00Z'

        mockUseTicketThreadMessages.mockReturnValue({
            messages: [
                createMessageWithHttpAction(datetime, {
                    title: 'From Message',
                    status: 'success',
                    arguments: { url: 'https://example.com' },
                }),
            ],
            activePendingMessages: [],
            isLoading: false,
        })

        const matchingApiEvent: TicketThreadActionExecutedEventItem = {
            _tag: TicketThreadItemTag.Events.ActionExecutedEvent,
            datetime,
            data: {
                object_type: 'Ticket',
                type: 'action-executed' as const,
                created_datetime: datetime,
                user_id: 42,
                data: { action_name: 'customHttpAction' as const, payload: {} },
            },
        }

        mockUseTicketThreadEvents.mockReturnValue({
            events: [matchingApiEvent],
            hasSatisfactionSurveyRespondedEvent: false,
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: true }),
        )

        const actionItems = result.current.ticketThreadItems.filter(
            (item): item is TicketThreadActionExecutedEventItem =>
                item._tag === TicketThreadItemTag.Events.ActionExecutedEvent,
        )
        expect(actionItems).toHaveLength(1)
        expect(actionItems[0].data.data.action_label).toBe('From Message')
    })

    it('preserves customHttpAction events with no matching message-extracted item', () => {
        const datetime = '2024-03-21T11:00:00Z'
        const automationDatetime = '2024-03-21T11:05:00Z'

        mockUseTicketThreadMessages.mockReturnValue({
            messages: [createMessageWithHttpAction(datetime)],
            activePendingMessages: [],
            isLoading: false,
        })

        const automationEvent: TicketThreadActionExecutedEventItem = {
            _tag: TicketThreadItemTag.Events.ActionExecutedEvent,
            datetime: automationDatetime,
            data: {
                object_type: 'Ticket',
                type: 'action-executed' as const,
                created_datetime: automationDatetime,
                user_id: 42,
                data: { action_name: 'customHttpAction' as const, payload: {} },
            },
        }

        mockUseTicketThreadEvents.mockReturnValue({
            events: [automationEvent],
            hasSatisfactionSurveyRespondedEvent: false,
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: true }),
        )

        const actionItems = result.current.ticketThreadItems.filter(
            (item): item is TicketThreadActionExecutedEventItem =>
                item._tag === TicketThreadItemTag.Events.ActionExecutedEvent,
        )
        expect(actionItems).toHaveLength(2)
    })

    it('preserves non-customHttpAction ActionExecutedEvents regardless of matching key', () => {
        const datetime = '2024-03-21T11:00:00Z'

        mockUseTicketThreadMessages.mockReturnValue({
            messages: [createMessageWithHttpAction(datetime)],
            activePendingMessages: [],
            isLoading: false,
        })

        const shopifyEvent: TicketThreadActionExecutedEventItem = {
            _tag: TicketThreadItemTag.Events.ActionExecutedEvent,
            datetime,
            data: {
                object_type: 'Ticket',
                type: 'action-executed' as const,
                created_datetime: datetime,
                user_id: 42,
                data: {
                    action_name: 'shopifyRefundOrder' as const,
                    payload: {},
                },
            },
        }

        mockUseTicketThreadEvents.mockReturnValue({
            events: [shopifyEvent],
            hasSatisfactionSurveyRespondedEvent: false,
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: true }),
        )

        const actionItems = result.current.ticketThreadItems.filter(
            (item): item is TicketThreadActionExecutedEventItem =>
                item._tag === TicketThreadItemTag.Events.ActionExecutedEvent,
        )
        expect(actionItems).toHaveLength(2)
        expect(
            actionItems.some(
                (item) => item.data.data.action_name === 'shopifyRefundOrder',
            ),
        ).toBe(true)
        expect(
            actionItems.some(
                (item) => item.data.data.action_name === 'customHttpAction',
            ),
        ).toBe(true)
    })

    it('does not merge events separated by insertion items', () => {
        const firstEvent = {
            _tag: TicketThreadItemTag.Events.TicketEvent,
            datetime: '2024-03-21T11:01:00Z',
            data: { id: 1 },
        }
        const secondEvent = {
            _tag: TicketThreadItemTag.Events.PhoneEvent,
            datetime: '2024-03-21T11:02:00Z',
            data: { id: 2 },
        }
        const contactMarker = {
            _tag: TicketThreadItemTag.ContactReasonSuggestion,
            data: null,
        }

        mockUseTicketThreadEvents.mockReturnValue({
            events: [firstEvent, secondEvent] as any,
            hasSatisfactionSurveyRespondedEvent: false,
        })
        mockUseContactReasonPrediction.mockReturnValue({
            insertContactReasonPrediction: (items) => [
                items[0],
                contactMarker,
                ...items.slice(1),
            ],
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: true }),
        )

        expect(result.current.ticketThreadItems).toEqual([
            firstEvent,
            contactMarker,
            secondEvent,
        ])
    })
})
