import { TicketChannel, TicketVia } from 'business/types/ticket'
import { TicketElement, TicketMessage } from 'models/ticket/types'

import {
    InfluencedOrderSource,
    ShoppingAssistantEvent,
} from './hooks/useInsertShoppingAssistantEventElements'
import { isShoppingAssistantEvent } from './utils'

describe('isShoppingAssistantEvent', () => {
    it('should return true for a shopping assistant event', () => {
        const event: ShoppingAssistantEvent = {
            isShoppingAssistantEvent: true,
            type: 'influenced-order',
            created_datetime: '2024-03-21T12:00:00Z',
            data: {
                orderId: 123,
                orderNumber: 456,
                shopName: 'Test Shop',
                createdDatetime: '2024-03-21T12:00:00Z',
                influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
            },
        }

        expect(isShoppingAssistantEvent(event)).toBe(true)
    })

    it('should return false for a ticket message', () => {
        const message: TicketMessage = {
            id: 1,
            integration_id: null,
            sender: {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
                firstname: 'Test',
                lastname: 'User',
            },
            receiver: null,
            subject: 'Test',
            stripped_html: null,
            stripped_text: null,
            channel: TicketChannel.Email,
            via: TicketVia.Email,
            uri: 'test',
            public: true,
            from_agent: false,
            meta: null,
            attachments: [],
            created_datetime: '2024-03-21T12:00:00Z',
            stripped_signature: null,
            actions: null,
            rule_id: null,
            external_id: null,
            failed_datetime: null,
            opened_datetime: null,
            is_retriable: false,
            isMessage: true,
            auth_customer_identity: null,
        }

        expect(isShoppingAssistantEvent(message)).toBe(false)
    })

    it('should return false for an object without isShoppingAssistantEvent property', () => {
        const element = {
            id: 1,
            type: 'some-type',
            data: {},
        }

        expect(isShoppingAssistantEvent(element as TicketElement)).toBe(false)
    })

    it('should return false for an object with isShoppingAssistantEvent set to false', () => {
        const event = {
            isShoppingAssistantEvent: false,
            type: 'influenced-order',
            created_datetime: '2024-03-21T12:00:00Z',
            data: {},
        }

        expect(isShoppingAssistantEvent(event as ShoppingAssistantEvent)).toBe(
            false,
        )
    })
})
