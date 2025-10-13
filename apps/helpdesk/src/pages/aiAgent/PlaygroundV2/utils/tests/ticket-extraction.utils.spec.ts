import { Ticket, TicketMessage } from '@gorgias/helpdesk-client'

import { extractTicketData } from '../ticket-extraction.utils'

describe('extractTicketData', () => {
    const mockTicket: Ticket = {
        id: 123,
        subject: 'Test Ticket Subject',
        customer: {
            id: 456,
            email: 'customer@example.com',
            name: 'John Doe',
            firstname: 'John',
            lastname: 'Doe',
        },
        messages: [
            {
                id: 1,
                isMessage: true,
                from_agent: true,
                body_text: 'Agent response',
                created_datetime: '2023-01-02T10:00:00Z',
            } as unknown as TicketMessage,
            {
                id: 2,
                isMessage: true,
                from_agent: false,
                body_text: 'First customer message',
                created_datetime: '2023-01-01T10:00:00Z',
            } as unknown as TicketMessage,
            {
                id: 3,
                isMessage: true,
                from_agent: false,
                body_text: 'Second customer message',
                created_datetime: '2023-01-03T10:00:00Z',
            } as unknown as TicketMessage,
        ],
    } as Ticket

    it('should extract customer data correctly', () => {
        const result = extractTicketData(mockTicket)

        expect(result.customer).toEqual({
            id: 456,
            email: 'customer@example.com',
            name: 'John Doe',
        })
    })

    it('should extract subject correctly', () => {
        const result = extractTicketData(mockTicket)

        expect(result.subject).toBe('Test Ticket Subject')
    })

    it('should extract first customer message correctly', () => {
        const result = extractTicketData(mockTicket)

        expect(result.message).toBe('First customer message')
    })

    it('should handle ticket with no customer name but has firstname and lastname', () => {
        const ticketWithoutName = {
            ...mockTicket,
            customer: {
                ...mockTicket.customer!,
                name: '',
                firstname: 'Jane',
                lastname: 'Smith',
            },
        }

        const result = extractTicketData(ticketWithoutName)

        expect(result.customer.name).toBe('Jane Smith')
    })

    it('should handle ticket with no customer messages', () => {
        const ticketWithoutCustomerMessages = {
            ...mockTicket,
            messages: [
                {
                    id: 1,
                    isMessage: true,
                    from_agent: true,
                    body_text: 'Agent response',
                    created_datetime: '2023-01-02T10:00:00Z',
                } as unknown as TicketMessage,
            ],
        }

        const result = extractTicketData(ticketWithoutCustomerMessages)

        expect(result.message).toBe('')
    })

    it('should handle ticket with no customer', () => {
        const ticketWithoutCustomer = {
            ...mockTicket,
            customer: null,
        } as unknown as Ticket

        const result = extractTicketData(ticketWithoutCustomer)

        expect(result.customer).toEqual({
            id: 0,
            email: '',
            name: '',
        })
    })

    it('should prefer stripped_text over body_text and other message content fields', () => {
        const ticketWithMultipleContentFields = {
            ...mockTicket,
            messages: [
                {
                    id: 1,
                    isMessage: true,
                    from_agent: false,
                    body_text: 'Body text content',
                    stripped_text: 'Stripped text content',
                    body_html: '<p>Body HTML content</p>',
                    stripped_html: '<p>Stripped HTML content</p>',
                    created_datetime: '2023-01-01T10:00:00Z',
                } as unknown as TicketMessage,
            ],
        }

        const result = extractTicketData(ticketWithMultipleContentFields)

        expect(result.message).toBe('Stripped text content')
    })

    it('should fall back to body_text when stripped_text is not available', () => {
        const ticketWithoutStrippedText = {
            ...mockTicket,
            messages: [
                {
                    id: 1,
                    isMessage: true,
                    from_agent: false,
                    body_text: 'Body text content',
                    body_html: '<p>Body HTML content</p>',
                    created_datetime: '2023-01-01T10:00:00Z',
                } as unknown as TicketMessage,
            ],
        }

        const result = extractTicketData(ticketWithoutStrippedText)

        expect(result.message).toBe('Body text content')
    })

    it('should convert line breaks to HTML breaks for proper display', () => {
        const ticketWithLineBreaks = {
            ...mockTicket,
            messages: [
                {
                    id: 1,
                    isMessage: true,
                    from_agent: false,
                    body_text: 'First line\nSecond line\nThird line',
                    created_datetime: '2023-01-01T10:00:00Z',
                } as unknown as TicketMessage,
            ],
        }

        const result = extractTicketData(ticketWithLineBreaks)

        expect(result.message).toBe('First line<br/>Second line<br/>Third line')
    })
})
