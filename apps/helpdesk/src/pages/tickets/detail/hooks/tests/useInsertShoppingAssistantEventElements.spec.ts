import { renderHook } from '@repo/testing'
import { UseQueryResult } from '@tanstack/react-query'

import { TicketChannel, TicketVia } from 'business/types/ticket'
import {
    InfluencedOrderData,
    useFetchInfluencedOrders,
} from 'hooks/aiAgent/useFetchInfluencedOrders'
import { useGetTicketContext } from 'hooks/aiAgent/useGetTicketContext'
import { ShopifyIntegration } from 'models/integration/types'
import { TicketMessage } from 'models/ticket/types'
import { useInsertShoppingAssistantEventElements } from 'pages/tickets/detail/hooks/useInsertShoppingAssistantEventElements'

jest.mock('hooks/aiAgent/useGetTicketContext')
const mockUseGetTicketContext = jest.mocked(useGetTicketContext)

jest.mock('hooks/aiAgent/useFetchInfluencedOrders')
const mockUseFetchInfluencedOrders = jest.mocked(useFetchInfluencedOrders)

describe('useInsertShoppingAssistantEventElements', () => {
    const mockTicketContext = {
        accountId: 123,
        customers: [{ id: 456, created_at: '2021-01-01T00:00:00.000Z' }],
        ticketId: 999,
        shopifyIntegrations: [{ name: 'Test Shop' }] as ShopifyIntegration[],
        orders: [
            { id: 789, order_number: 1001 },
            { id: 790, order_number: 1002 },
        ],
        createdAt: '2021-01-01T00:00:00.000Z',
    }

    const createMockMessage = (
        datetime: string,
        content: string,
    ): TicketMessage => ({
        id: 1,
        sender: {
            id: 1,
            email: 'agent@example.com',
            name: 'Agent',
            firstname: 'Agent',
            lastname: 'Test',
        },
        receiver: {
            id: 2,
            email: 'customer@example.com',
            name: 'Customer',
            firstname: 'Customer',
            lastname: 'Test',
        },
        subject: 'Test Subject',
        channel: TicketChannel.Email,
        via: TicketVia.Email,
        uri: 'http://example.com/messages/1',
        public: true,
        from_agent: false,
        created_datetime: datetime,
        isMessage: true,
        rule_id: null,
        external_id: null,
        is_retriable: false,
        stripped_signature: null,
        actions: null,
        failed_datetime: null,
        opened_datetime: null,
        integration_id: null,
        meta: null,
        stripped_html: null,
        stripped_text: null,
        attachments: [],
        body_text: content,
        auth_customer_identity: null,
    })

    beforeEach(() => {
        mockUseGetTicketContext.mockReturnValue(mockTicketContext)
        mockUseFetchInfluencedOrders.mockReturnValue({ data: [] } as any)
    })

    it('should return original elements when no influenced orders exist', () => {
        const bodyElements = [
            [createMockMessage('2024-01-01T10:00:00Z', 'Test message')],
        ]

        const { result } = renderHook(() =>
            useInsertShoppingAssistantEventElements(bodyElements),
        )

        expect(result.current).toEqual(bodyElements)
    })

    it('should insert influenced order events chronologically', () => {
        const bodyElements = [
            [createMockMessage('2024-01-01T10:00:00Z', 'Message 1')],
            [createMockMessage('2024-01-01T12:00:00Z', 'Message 2')],
        ]

        const influencedOrders = [
            {
                id: 789,
                ticketId: 999,
                createdDatetime: '2024-01-01T11:00:00Z',
            },
        ]

        mockUseFetchInfluencedOrders.mockReturnValue({
            data: influencedOrders,
        } as UseQueryResult<InfluencedOrderData[]>)

        const { result } = renderHook(() =>
            useInsertShoppingAssistantEventElements(bodyElements),
        )

        expect(result.current).toHaveLength(3)
        expect(result.current[0]).toEqual(bodyElements[0])
        expect(result.current[1]).toMatchObject({
            isShoppingAssistantEvent: true,
            type: 'influenced-order',
            created_datetime: '2024-01-01T11:00:00Z',
        })
        expect(result.current[2]).toEqual(bodyElements[1])
    })

    it('should filter out orders with different ticket id', () => {
        const bodyElements = [
            [createMockMessage('2024-01-01T10:00:00Z', 'Message 1')],
            [createMockMessage('2024-01-01T12:00:00Z', 'Message 2')],
        ]

        const influencedOrders = [
            {
                id: 789,
                ticketId: 999,
                createdDatetime: '2024-01-01T11:00:00Z',
            },
            {
                id: 145,
                ticketId: 111,
                createdDatetime: '2024-01-01T11:30:00Z',
            },
        ]

        mockUseFetchInfluencedOrders.mockReturnValue({
            data: influencedOrders,
        } as UseQueryResult<InfluencedOrderData[]>)

        const { result } = renderHook(() =>
            useInsertShoppingAssistantEventElements(bodyElements),
        )

        expect(result.current).toHaveLength(3)
        expect(result.current[0]).toEqual(bodyElements[0])
        expect(result.current[1]).toMatchObject({
            isShoppingAssistantEvent: true,
            type: 'influenced-order',
            created_datetime: '2024-01-01T11:00:00Z',
        })
        expect(result.current[2]).toEqual(bodyElements[1])
    })

    it('should return original elements when required context is missing', () => {
        const bodyElements = [
            [createMockMessage('2024-01-01T10:00:00Z', 'Test message')],
        ]

        mockUseGetTicketContext.mockReturnValue({
            accountId: null as any,
            ticketId: undefined,
            customers: [],
            shopifyIntegrations: [],
            orders: [],
            createdAt: '2021-01-01T00:00:00.000Z',
        })

        const { result } = renderHook(() =>
            useInsertShoppingAssistantEventElements(bodyElements),
        )

        expect(result.current).toEqual(bodyElements)
    })
})
