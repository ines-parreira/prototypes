import React from 'react'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {render} from '@testing-library/react'
import {TicketChannel} from 'business/types/ticket'
import {mergeCustomers} from 'state/customers/actions'

import MergeCustomersModal from 'pages/common/components/MergeCustomers/MergeCustomersModal'

const address1 = 'pierre@gorgias.io'
const address2 = 'Pierre@gorgias.io'

const customer1 = fromJS({
    id: 1,
    data: {},
    channels: [
        {
            type: TicketChannel.Email,
            address: address1,
            preferred: true,
            customer: {
                id: 1,
                name: 'Pierre',
            },
        },
    ],
    name: 'Pierre',
    note: null,
    email: address1,
})

const customer2 = fromJS({
    id: 2,
    data: {},
    channels: [
        {
            type: TicketChannel.Email,
            address: address2,
            preferred: false,
            customer: {
                id: 2,
                name: 'Pierre',
            },
        },
    ],
    name: 'Pierre',
    note: null,
    email: address2,
})

describe('<MergeCustomersModal/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <MergeCustomersModal
                    destinationCustomer={customer1}
                    sourceCustomer={customer2}
                    mergeCustomers={mergeCustomers as any}
                    toggleModal={_noop}
                    onSuccess={_noop}
                    isOpen={true}
                    isLoading={false}
                    requiredAddresses={fromJS([address1])}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
