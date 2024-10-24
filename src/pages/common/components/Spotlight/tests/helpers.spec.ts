import _pick from 'lodash/pick'

import {TicketChannel} from 'business/types/ticket'
import {ticket} from 'fixtures/ticket'
import {Customer} from 'models/customer/types'
import {
    TicketHighlights,
    CustomerHighlights,
    PickedTicket,
} from 'models/search/types'
import {
    ticketHighlightsTransform,
    customerHighlightsTransform,
    trimWithEllipsisBeforeTheHighlight,
    HIGHLIGHT_TAG,
} from 'pages/common/components/Spotlight/helpers'

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
            highlights: highlight,
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
            highlights: {
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
            highlights: {
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
            highlights: {
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
            highlights: {
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
            highlights: {
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
            highlights: {
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
            highlights: emptyHighlight,
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
            highlights: undefined,
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
            highlights: {},
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
        ({item, highlights, expectedResult}) => {
            expect(ticketHighlightsTransform({...item, highlights})).toEqual(
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
            highlights: highlight,
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
            highlights: _pick(highlight, 'email'),
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
            highlights: _pick(highlight, 'name'),
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
            highlights: _pick(highlight, 'channels.address'),
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
            highlights: emptyHighlight,
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
        ({item, highlights, expectedResult}) => {
            const transformed = customerHighlightsTransform({
                ...item,
                highlights,
            })

            expect(transformed).toEqual(expectedResult.itemWithHighlights)
        }
    )
})

describe('trimWithEllipsisBeforeTheHighlight', () => {
    it.each([
        {
            highlight: '',
            trimmedHighlight: '',
        },
        {
            highlight: 'Some text without highlight',
            trimmedHighlight: 'Some text without highlight',
        },
        {
            highlight: `Some text with ${HIGHLIGHT_TAG}highlight</em> and some more text`,
            trimmedHighlight: `Some text with ${HIGHLIGHT_TAG}highlight</em> and some more text`,
        },
        {
            highlight: `Some text with long sentence preceeding the ${HIGHLIGHT_TAG}highlight</em> and some more text`,
            trimmedHighlight: `...preceeding the ${HIGHLIGHT_TAG}highlight</em> and some more text`,
        },
        {
            highlight: `preceeding the ${HIGHLIGHT_TAG}highlight</em> and some more text`,
            trimmedHighlight: `preceeding the ${HIGHLIGHT_TAG}highlight</em> and some more text`,
        },
    ])(
        'should trim this $highlight to $trimmedHighlight',
        ({highlight, trimmedHighlight}) => {
            expect(trimWithEllipsisBeforeTheHighlight(highlight, 15)).toEqual(
                trimmedHighlight
            )
        }
    )
})
