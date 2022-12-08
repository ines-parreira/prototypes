import {products} from 'fixtures/productPrices'

export const billingState = {
    paymentMethod: 'stripe',
    contact: {
        email: 'hello@acme.gorgias.io',
        shipping: {
            name: 'Gorgias',
            phone: '4155555556',
            address: {
                line1: '34 Harriet St',
                line2: '',
                city: 'San Francisco',
                state: 'CA',
                country: 'United States',
                postal_code: '94103',
            },
        },
    },
    currentUsage: {
        data: {
            cost: 0,
            tickets: 2,
            extra_tickets: 0,
        },
        meta: {
            start_datetime: '2017-08-22T00:46:32+00:00',
            end_datetime: '2017-09-05T00:46:32+00:00',
        },
    },
    invoices: [
        {
            metadata: {},
            paid: true,
            attempted: true,
            date: '2016-11-13T18:30:19+00:00',
            amount_due: 1234,
        },
        {
            metadata: {},
            paid: true,
            date: '2016-11-14T18:30:19+00:00',
            amount_due: 1234,
        },
        {
            metadata: {},
            paid: false,
            attempted: true,
            date: '2016-11-15T18:30:19+00:00',
            amount_due: 0,
        },
    ],
    creditCard: {
        name: 'Alex',
        number: '545454545454',
        expDate: '10/23',
        cvc: '123',
    },
    products: products,
}
