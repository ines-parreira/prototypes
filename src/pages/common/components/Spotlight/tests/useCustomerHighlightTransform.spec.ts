import _pick from 'lodash/pick'
import {renderHook} from '@testing-library/react-hooks'
import {Customer} from 'models/customer/types'
import {TicketChannel} from 'business/types/ticket'
import {CustomerHighlights} from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import {useCustomerHighlightTransform} from 'pages/common/components/Spotlight/useCustomerHighlightTransform'

describe('useCustomerHighlightTransform', () => {
    const highlight: CustomerHighlights = {
        email: ['<em>email</em>@test.com'],
        name: ['<em>John</em> Smith'],
        'channels.address': ['<em>address</em>'],
        order_ids: ['<em>123</em>'],
    }

    const emptyHighlight = {
        email: [],
        name: [],
        'channels.address': [],
        order_ids: [],
    }

    const item = {
        id: 1,
        name: 'John Smith',
        email: 'email@test.com',
        channels: [
            {
                type: TicketChannel.Phone,
                address: 'phone number',
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
                    ...item,
                    email: '<em>email</em>@test.com',
                    name: '<em>John</em> Smith',
                    'channels.address': '<em>address</em>',
                    order_ids: '<em>123</em>',
                },
                phoneNumberOrAddress: '<em>address</em>',
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'email'),
            expectedResult: {
                itemWithHighlights: {...item, email: '<em>email</em>@test.com'},
                phoneNumberOrAddress: 'phone number',
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'name'),
            expectedResult: {
                itemWithHighlights: {...item, name: '<em>John</em> Smith'},
                phoneNumberOrAddress: 'phone number',
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'order_ids'),
            expectedResult: {
                itemWithHighlights: {...item, order_ids: '<em>123</em>'},
                phoneNumberOrAddress: 'phone number',
            },
        },
        {
            item: item,
            highlight: _pick(highlight, 'channels.address'),
            expectedResult: {
                itemWithHighlights: {
                    ...item,
                    'channels.address': '<em>address</em>',
                },
                phoneNumberOrAddress: '<em>address</em>',
            },
        },
        {
            item: item,
            highlight: emptyHighlight,
            expectedResult: {
                itemWithHighlights: item,
                phoneNumberOrAddress: 'phone number',
            },
        },
    ])(
        'should check if highlight is passed and return item with highlights and phone number',
        ({item, highlight, expectedResult}) => {
            const {result} = renderHook(() =>
                useCustomerHighlightTransform(highlight, item)
            )

            expect(result.current.itemWithHighlights).toEqual(
                expectedResult.itemWithHighlights
            )
            expect(result.current.phoneNumberOrAddress).toBe(
                expectedResult.phoneNumberOrAddress
            )
        }
    )
})
