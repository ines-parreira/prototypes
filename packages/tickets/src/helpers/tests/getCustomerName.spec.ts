import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { getCustomerName } from '../getCustomerName'

describe('getCustomerName', () => {
    it('should return "Unknown customer" if no customer is given', () => {
        const name = getCustomerName()
        expect(name).toBe('Unknown customer')
    })

    it('should return the customer name if it exists', () => {
        const name = getCustomerName({ name: 'John Doe' } as TicketCustomer)
        expect(name).toBe('John Doe')
    })

    it('should return the customer email if it exists', () => {
        const name = getCustomerName({
            email: 'john.doe@example.com',
        } as TicketCustomer)
        expect(name).toBe('john.doe@example.com')
    })

    it('should return the customer id if it exists', () => {
        const name = getCustomerName({ id: 1234 } as TicketCustomer)
        expect(name).toBe('Customer #1234')
    })

    it('should return "Unknown customer" if other properties are not available', () => {
        const name = getCustomerName({} as TicketCustomer)
        expect(name).toBe('Unknown customer')
    })
})
