import { renderHook } from '@testing-library/react'

import type { CustomField, TicketCompact } from '@gorgias/helpdesk-queries'

import { TicketChannel } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/types'

import { channelToCommunicationIcon } from '../channelToCommunicationIcon'
import { useTicketTimelineData } from '../useTicketTimelineData'

// Mock the custom field conditions hook
jest.mock('custom-fields/hooks/queries/useCustomFieldConditions', () => ({
    useCustomFieldConditions: () => ({
        customFieldConditions: [],
        isLoading: false,
    }),
}))

const createMockTicket = (
    overrides: Partial<TicketCompact>,
): TicketCompact => ({
    id: 1,
    uri: 'https://example.com',
    external_id: null,
    language: 'en',
    status: 'open',
    priority: 'normal',
    channel: 'email',
    via: 'email',
    customer: {
        id: 123,
        email: 'customer@example.com',
        name: 'Test Customer',
    } as any,
    assignee_user: null,
    assignee_team: null,
    subject: 'Test Subject',
    excerpt: 'Test excerpt',
    created_datetime: '2025-01-01T00:00:00Z',
    updated_datetime: '2025-01-01T00:00:00Z',
    opened_datetime: '2025-01-01T00:00:00Z',
    last_received_message_datetime: '2025-01-01T00:00:00Z',
    last_message_datetime: '2025-01-01T00:00:00Z',
    last_sent_message_not_delivered: false,
    spam: false,
    trashed_datetime: null,
    closed_datetime: null,
    snooze_datetime: null,
    is_unread: false,
    tags: [],
    custom_fields: null,
    integrations: [],
    messages_count: 1,
    from_agent: false,
    meta: {},
    ...overrides,
})

const mockChannelToIcon = (channel?: string) => {
    const channelMap: Record<string, any> = {
        email: 'comm-mail',
        chat: 'comm-chat-dots',
        phone: 'comm-phone',
    }
    return channelMap[channel || ''] || 'comm-mail'
}

describe('useTicketTimelineData', () => {
    const defaultProps = {
        tickets: [] as TicketCompact[],
        customFieldDefinitions: [] as CustomField[],
        activeTicketId: undefined,
        channelToIcon: mockChannelToIcon,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Ticket counts', () => {
        it('should return correct totalNumber', () => {
            const tickets = [
                createMockTicket({ id: 1 }),
                createMockTicket({ id: 2 }),
                createMockTicket({ id: 3 }),
            ]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                }),
            )

            expect(result.current.totalNumber).toBe(3)
        })

        it('should return correct openTicketsNumber', () => {
            const tickets = [
                createMockTicket({ id: 1, status: 'open' }),
                createMockTicket({ id: 2, status: 'open' }),
                createMockTicket({ id: 3, status: 'closed' }),
            ]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                }),
            )

            expect(result.current.openTicketsNumber).toBe(2)
        })

        it('should return correct snoozedTicketsNumber', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    status: 'closed',
                    snooze_datetime: '2025-01-02T00:00:00Z',
                }),
                createMockTicket({
                    id: 2,
                    status: 'closed',
                    snooze_datetime: '2025-01-03T00:00:00Z',
                }),
                createMockTicket({ id: 3, status: 'open' }),
            ]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                }),
            )

            expect(result.current.snoozedTicketsNumber).toBe(2)
        })
    })

    describe('Ticket filtering and prioritization', () => {
        it('should return all tickets when there is only one', () => {
            const tickets = [createMockTicket({ id: 1 })]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                }),
            )

            expect(result.current.displayedTickets).toHaveLength(1)
            expect(result.current.displayedTickets[0].ticket.id).toBe(1)
        })

        it('should exclude active ticket from displayed tickets', () => {
            const tickets = [
                createMockTicket({ id: 1 }),
                createMockTicket({ id: 2 }),
                createMockTicket({ id: 3 }),
            ]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                    activeTicketId: '2',
                }),
            )

            const displayedIds = result.current.displayedTickets.map(
                (t) => t.ticket.id,
            )
            expect(displayedIds).not.toContain(2)
        })

        it('should prioritize open tickets over closed tickets', () => {
            const tickets = [
                createMockTicket({ id: 1, status: 'closed' }),
                createMockTicket({ id: 2, status: 'open' }),
                createMockTicket({ id: 3, status: 'open' }),
            ]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                }),
            )

            const displayedIds = result.current.displayedTickets.map(
                (t) => t.ticket.id,
            )
            // When open tickets exist, they should be displayed (closed may be excluded)
            expect(displayedIds).toContain(2)
            expect(displayedIds).toContain(3)
        })

        it('should include snoozed tickets', () => {
            const tickets = [
                createMockTicket({ id: 1, status: 'closed' }),
                createMockTicket({
                    id: 2,
                    status: 'closed',
                    snooze_datetime: '2025-01-02T00:00:00Z',
                }),
                createMockTicket({
                    id: 3,
                    status: 'open',
                    snooze_datetime: '2025-01-03T00:00:00Z',
                }),
            ]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                }),
            )

            const displayedIds = result.current.displayedTickets.map(
                (t) => t.ticket.id,
            )
            // Snoozed tickets should be included
            expect(displayedIds).toContain(2)
            expect(displayedIds).toContain(3)
        })

        it('should limit displayed tickets to 3', () => {
            const tickets = [
                createMockTicket({ id: 1, status: 'open' }),
                createMockTicket({ id: 2, status: 'open' }),
                createMockTicket({ id: 3, status: 'open' }),
                createMockTicket({ id: 4, status: 'open' }),
                createMockTicket({ id: 5, status: 'open' }),
            ]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                }),
            )

            expect(result.current.displayedTickets).toHaveLength(3)
        })

        it('should show one closed ticket when no open or snoozed tickets', () => {
            const tickets = [
                createMockTicket({ id: 1, status: 'closed' }),
                createMockTicket({ id: 2, status: 'closed' }),
                createMockTicket({ id: 3, status: 'closed' }),
            ]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                }),
            )

            expect(result.current.displayedTickets).toHaveLength(1)
        })
    })

    describe('Ticket enrichment', () => {
        it('should enrich tickets with iconName', () => {
            const tickets = [
                createMockTicket({ id: 1, channel: 'email' }),
                createMockTicket({ id: 2, channel: 'chat' }),
            ]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                }),
            )

            expect(result.current.displayedTickets[0].iconName).toBe(
                'comm-mail',
            )
            expect(result.current.displayedTickets[1].iconName).toBe(
                'comm-chat-dots',
            )
        })

        it('should enrich tickets with custom fields array', () => {
            const customFieldDefinitions = [
                {
                    id: 1,
                    name: 'priority',
                    label: 'Priority',
                    type: 'text',
                },
            ] as any as CustomField[]

            const tickets = [
                createMockTicket({
                    id: 1,
                    custom_fields: {
                        1: { id: 1, value: 'high' },
                    } as any,
                }),
            ]

            const { result } = renderHook(() =>
                useTicketTimelineData({
                    ...defaultProps,
                    tickets,
                    customFieldDefinitions,
                }),
            )

            // Should have customFields array even if empty (fields may be filtered by visibility)
            expect(
                result.current.displayedTickets[0].customFields,
            ).toBeDefined()
            expect(
                Array.isArray(result.current.displayedTickets[0].customFields),
            ).toBe(true)
        })
    })

    describe('channelToCommunicationIcon', () => {
        describe('E-commerce platforms', () => {
            it('should return shopify icon for shopify channel', () => {
                expect(channelToCommunicationIcon('shopify')).toBe(
                    'app-shopify',
                )
            })

            it('should return magento icon for magento2 channel', () => {
                expect(channelToCommunicationIcon('magento2')).toBe(
                    'app-magento',
                )
            })

            it('should return woocommerce icon for woocommerce channel', () => {
                expect(channelToCommunicationIcon('woocommerce')).toBe(
                    'app-woo',
                )
            })

            it('should return bigcommerce icon for bigcommerce channel', () => {
                expect(channelToCommunicationIcon('bigcommerce')).toBe(
                    'app-bicommerce',
                )
            })
        })

        describe('Social media channels', () => {
            it('should return facebook icon for facebook channel', () => {
                expect(channelToCommunicationIcon(TicketChannel.Facebook)).toBe(
                    'channel-facebook',
                )
            })

            it('should return facebook messenger icon for facebook-messenger channel', () => {
                expect(
                    channelToCommunicationIcon(TicketChannel.FacebookMessenger),
                ).toBe('channel-fb-messenger')
            })

            it('should return instagram icon for instagram channel', () => {
                expect(
                    channelToCommunicationIcon(TicketChannel.InstagramMention),
                ).toBe('channel-instagram')
            })

            it('should return instagram DM icon for instagram-dm channel', () => {
                expect(
                    channelToCommunicationIcon(
                        TicketChannel.InstagramDirectMessage,
                    ),
                ).toBe('channel-instagram-dm')
            })
        })

        describe('Communication channels', () => {
            it('should return phone icon for phone channel', () => {
                expect(channelToCommunicationIcon(TicketChannel.Phone)).toBe(
                    'comm-phone',
                )
            })

            it('should return chat icon for sms channel', () => {
                expect(channelToCommunicationIcon(TicketChannel.Sms)).toBe(
                    'comm-chat-dots',
                )
            })

            it('should return whatsapp icon for whatsapp channel', () => {
                expect(channelToCommunicationIcon(TicketChannel.WhatsApp)).toBe(
                    'channel-whatsapp',
                )
            })

            it('should return chat circle icon for chat channel', () => {
                expect(channelToCommunicationIcon(TicketChannel.Chat)).toBe(
                    'comm-chat-circle-dots',
                )
            })

            it('should return mail icon for email channel', () => {
                expect(channelToCommunicationIcon(TicketChannel.Email)).toBe(
                    'comm-mail',
                )
            })
        })

        describe('Default behavior', () => {
            it('should return mail icon for undefined channel', () => {
                expect(channelToCommunicationIcon(undefined)).toBe('comm-mail')
            })

            it('should return mail icon for unknown channel', () => {
                expect(channelToCommunicationIcon('unknown' as any)).toBe(
                    'comm-mail',
                )
            })
        })

        describe('Integration with useTicketTimelineData', () => {
            it('should use channelToCommunicationIcon to set iconName for tickets', () => {
                const tickets = [
                    createMockTicket({
                        id: 1,
                        channel: TicketChannel.Email as any,
                    }),
                    createMockTicket({
                        id: 2,
                        channel: TicketChannel.Chat as any,
                    }),
                    createMockTicket({
                        id: 3,
                        channel: TicketChannel.Phone as any,
                    }),
                ]

                const { result } = renderHook(() =>
                    useTicketTimelineData({
                        ...defaultProps,
                        tickets,
                        channelToIcon: channelToCommunicationIcon,
                    }),
                )

                expect(result.current.displayedTickets[0].iconName).toBe(
                    'comm-mail',
                )
                expect(result.current.displayedTickets[1].iconName).toBe(
                    'comm-chat-circle-dots',
                )
                expect(result.current.displayedTickets[2].iconName).toBe(
                    'comm-phone',
                )
            })

            it('should handle shopify channel in ticket', () => {
                const tickets = [
                    createMockTicket({
                        id: 1,
                        channel: IntegrationType.Shopify as any,
                    }),
                ]

                const { result } = renderHook(() =>
                    useTicketTimelineData({
                        ...defaultProps,
                        tickets,
                        channelToIcon: channelToCommunicationIcon,
                    }),
                )

                expect(result.current.displayedTickets[0].iconName).toBe(
                    'app-shopify',
                )
            })

            it('should handle whatsapp channel in ticket', () => {
                const tickets = [
                    createMockTicket({
                        id: 1,
                        channel: TicketChannel.WhatsApp as any,
                    }),
                ]

                const { result } = renderHook(() =>
                    useTicketTimelineData({
                        ...defaultProps,
                        tickets,
                        channelToIcon: channelToCommunicationIcon,
                    }),
                )

                expect(result.current.displayedTickets[0].iconName).toBe(
                    'channel-whatsapp',
                )
            })
        })
    })
})
