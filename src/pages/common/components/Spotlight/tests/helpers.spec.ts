import _pick from 'lodash/pick'
import {Ticket} from 'models/ticket/types'
import {TicketChannel} from 'business/types/ticket'
import {ticketHighlightTransform} from 'pages/common/components/Spotlight/helpers'
import {TicketHighlights} from '../SpotlightTicketRow'

describe('useTicketHighlightTransform', () => {
    const highlight: TicketHighlights = {
        id: ['<em>12345</em>'],
        subject: ['<em>subject</em>'],
        'messages.body': ['text here <em>body</em> and text here'],
        'messages.from.name': ['<em>from name</em>'],
        'messages.from.address': ['<em>from address</em>'],
        'messages.to.name': ['<em>to name</em>'],
        'messages.to.address': ['<em>to address</em>'],
    }

    const emptyHighlight = {
        email: [],
        name: [],
        'channels.address': [],
        order_ids: [],
    } as TicketHighlights

    const item = {
        id: 12345,
        subject: 'subject',
        messages: [
            {
                id: 1,
                body: 'text here body and text here',
                from: {
                    name: 'from name',
                    address: 'from address',
                },
                to: {
                    name: 'to name',
                    address: 'to address',
                },
            },
        ],
        assignee_user: {
            id: 1,
            name: 'John Smith',
            email: 'email@test.com',
        },
        customer: {
            id: 1,
            name: 'John Smith',
            email: 'email@test.com',
            channels: [
                {
                    type: TicketChannel.Phone,
                    address: 'phone number',
                },
            ],
        },
    } as unknown as Ticket
    it.each([
        {
            item: item,
            highlight: highlight,
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    customer: {
                        ...item.customer,
                        name: '<em>from name</em>',
                        email: '<em>from address</em>',
                    },
                    assignee_user: {
                        ...item.assignee_user,
                        name: '<em>to name</em>',
                        email: '<em>to address</em>',
                    },
                    subject: '<em>subject</em>',
                },
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'subject'),
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    subject: '<em>subject</em>',
                },
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'messages.body'),
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    subject: 'text here <em>body</em> and text here',
                },
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'messages.from.name'),
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    customer: {
                        ...item.customer,
                        name: '<em>from name</em>',
                    },
                },
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'messages.from.address'),
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    customer: {
                        ...item.customer,
                        email: '<em>from address</em>',
                    },
                },
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'messages.to.name'),
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    assignee_user: {
                        ...item.assignee_user,
                        name: '<em>to name</em>',
                    },
                },
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'messages.to.address'),
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    assignee_user: {
                        ...item.assignee_user,
                        email: '<em>to address</em>',
                    },
                },
            },
        },
        {
            item: item,
            highlight: emptyHighlight,
            expectedResult: {
                itemWithHighlights: item,
            },
        },
    ])(
        'should check if highlight is passed and return right items with highlights',
        ({item, highlight, expectedResult}) => {
            expect(ticketHighlightTransform(highlight, item)).toEqual(
                expectedResult.itemWithHighlights
            )
        }
    )
})
