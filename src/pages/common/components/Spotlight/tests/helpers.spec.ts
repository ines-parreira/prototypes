import _pick from 'lodash/pick'
import {customer} from 'fixtures/customer'
import {ticket} from 'fixtures/ticket'
import {TicketHighlights, CustomerHighlights} from 'models/search/types'
import {ViewType} from 'models/view/types'
import {
    getTypedHighlightResults,
    ticketHighlightsTransform,
    customerHighlightsTransform,
} from 'pages/common/components/Spotlight/helpers'
import {PickedTicket} from 'pages/common/components/Spotlight/SpotlightTicketRow'
import {Customer} from 'models/customer/types'
import {TicketChannel} from 'business/types/ticket'

describe('ticketHighlightsTransform', () => {
    const highlightedTicketId = '<em>12345</em>'
    const highlightedSubject = '<em>subject</em>'
    const highlightedMessageBody = 'text here <em>body</em> and text here'
    const highlightedMessageSenderName = '<em>from name</em>'
    const highlightedMessageSenderAddress = '<em>from address</em>'
    const highlightedMessageRecipientName = '<em>to name</em>'
    const highlightedMessageRecipientAddress = '<em>to address</em>'
    const highlight: TicketHighlights = {
        id: [highlightedTicketId],
        subject: [highlightedSubject],
        messages: {
            body: [highlightedMessageBody],
            from: {
                name: [highlightedMessageSenderName],
                address: [highlightedMessageSenderAddress],
            },
            to: {
                name: [highlightedMessageRecipientName],
                address: [highlightedMessageRecipientAddress],
            },
        },
    }

    const emptyHighlight: TicketHighlights = {}

    const item: PickedTicket = {
        ...ticket,
        id: 12345,
        subject: 'subject',
        customer: {
            id: 1,
            name: 'John Smith',
            email: 'email@test.com',
        },
        excerpt: 'default excerpt text',
    }
    it.each([
        {
            item: item,
            highlight: highlight,
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    customer: highlightedMessageSenderName,
                    title: highlightedSubject,
                    message: highlightedMessageBody,
                    ticketId: `Ticket ID: ${highlightedTicketId}`,
                },
            },
        },
        {
            item: item,
            highlight: {
                subject: highlight.subject,
            },
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    title: highlightedSubject,
                    message: item.excerpt,
                    customer: item.customer.name,
                },
            },
        },
        {
            item: item,
            highlight: {
                messages: {
                    body: [highlightedMessageBody],
                },
            },
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    title: item.subject,
                    message: highlightedMessageBody,
                    customer: item.customer.name,
                },
            },
        },
        {
            item: item,
            highlight: {
                messages: {
                    from: {
                        name: [highlightedMessageSenderName],
                    },
                },
            },
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    title: item.subject,
                    message: item.excerpt,
                    customer: highlightedMessageSenderName,
                },
            },
        },
        {
            item: item,
            highlight: {
                messages: {
                    from: {
                        address: [highlightedMessageSenderAddress],
                    },
                },
            },
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    title: item.subject,
                    message: item.excerpt,
                    customer: highlightedMessageSenderAddress,
                },
            },
        },
        {
            item: item,
            highlight: {
                messages: {
                    to: {
                        name: [highlightedMessageRecipientName],
                    },
                },
            },
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    title: item.subject,
                    message: item.excerpt,

                    customer: highlightedMessageRecipientName,
                },
            },
        },
        {
            item: item,
            highlight: {
                messages: {
                    to: {
                        address: [highlightedMessageRecipientAddress],
                    },
                },
            },
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    title: item.subject,
                    message: item.excerpt,
                    customer: highlightedMessageRecipientAddress,
                },
            },
        },
        {
            item: item,
            highlight: emptyHighlight,
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    title: item.subject,
                    message: item.excerpt,
                    customer: item.customer.name,
                },
            },
        },
        {
            item: item,
            highlight: undefined,
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    customer: item.customer.name,
                    title: item.subject,
                    message: undefined,
                },
            },
        },
        {
            item: {...item, subject: ''},
            highlight: {},
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    subject: '',
                    title: '',
                    customer: item.customer.name,
                    message: item.excerpt,
                },
            },
        },
    ])(
        'should check if highlight is passed and return right items with highlights $#',
        ({item, highlight, expectedResult}) => {
            expect(ticketHighlightsTransform(item, highlight)).toEqual(
                expectedResult.itemWithHighlights
            )
        }
    )
})

describe('customerHighlightsTransform', () => {
    const highlightedOrderId = '<em>123</em>'
    const highlight: CustomerHighlights = {
        email: ['<em>email</em>@test.com'],
        name: ['<em>John</em> Smith'],
        channels: {address: ['<em>address</em>']},
        order_ids: [highlightedOrderId],
    }

    const emptyHighlight = {
        email: [],
        name: [],
        phoneNumberOrAddress: [],
        order_ids: [],
    }

    const customerPhoneNumber = 'phone number'
    const item = {
        id: 1,
        name: 'John Smith',
        email: 'email@test.com',
        channels: [
            {
                type: TicketChannel.Phone,
                address: customerPhoneNumber,
            },
        ] as Customer['channels'],
        note: 'some note',
    } as Customer

    it.each([
        {
            item: item,
            highlight: highlight,
            expectedResult: {
                itemWithHighlights: {
                    id: item.id,
                    email: '<em>email</em>@test.com',
                    name: '<em>John</em> Smith',
                    phoneNumberOrAddress: '<em>address</em>',
                    orderId: `Order ID: ${highlightedOrderId}`,
                },
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'email'),
            expectedResult: {
                itemWithHighlights: {
                    id: item.id,
                    name: item.name,
                    email: '<em>email</em>@test.com',
                    phoneNumberOrAddress: customerPhoneNumber,
                },
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'name'),
            expectedResult: {
                itemWithHighlights: {
                    id: item.id,
                    email: item.email,
                    name: '<em>John</em> Smith',
                    phoneNumberOrAddress: customerPhoneNumber,
                },
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'channels.address'),
            expectedResult: {
                itemWithHighlights: {
                    id: item.id,
                    name: item.name,
                    email: item.email,
                    phoneNumberOrAddress: '<em>address</em>',
                },
            },
        },
        {
            item: item,
            highlight: emptyHighlight,
            expectedResult: {
                itemWithHighlights: {
                    id: item.id,
                    name: item.name,
                    email: item.email,
                    phoneNumberOrAddress: customerPhoneNumber,
                    orderId: undefined,
                },
            },
        },
    ])(
        'should check if highlight is passed and return item with highlights and phone number $#',
        ({item, highlight, expectedResult}) => {
            const transformed = customerHighlightsTransform(highlight, item)

            expect(transformed).toEqual(expectedResult.itemWithHighlights)
        }
    )
})

describe('getTypedHighlightResults', () => {
    it('should add type field to passed customers', () => {
        const customerWithHighlights = {
            entity: customer,
            highlights: {},
        }
        const typedCustomers = getTypedHighlightResults(
            [customerWithHighlights],
            ViewType.CustomerList
        )

        expect(typedCustomers).toEqual([
            {
                ...customerWithHighlights,
                type: 'Customer',
            },
        ])
    })

    it('should add type field to passed tickets', () => {
        const ticketWithHighlights = {
            entity: ticket as PickedTicket,
            highlights: {},
        }
        const typedTicket = getTypedHighlightResults(
            [ticketWithHighlights],
            ViewType.TicketList
        )

        expect(typedTicket).toEqual([
            {
                ...ticketWithHighlights,
                type: 'Ticket',
            },
        ])
    })
})
