// @flow
import { humanize } from '../format'

describe('Business', () => {
    describe('format', () => {
        describe('humanize()', () => {
            const inputs = [
                {
                    value: '',
                    expect: '',
                },
                {
                    value: 'ticket',
                    expect: 'Ticket',
                },
                {
                    value: 'customerOrders',
                    expect: 'Customer orders',
                },
                {
                    value: 'order_id',
                    expect: 'Order id',
                },
                {
                    value: 'helper hello',
                    expect: 'Helper hello',
                },
                {
                    value: 'ticket-created',
                    expect: 'Ticket created',
                },
            ]

            it('should humanize strings', () => {
                // Given

                // When
                inputs.forEach((input) => {
                    // Then
                    expect(humanize(input.value)).toEqual(input.expect)
                })
            })
        })
    })
})
