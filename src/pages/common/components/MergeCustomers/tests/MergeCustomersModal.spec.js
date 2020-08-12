import React from 'react'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import {shallow} from 'enzyme'

import {EMAIL_CHANNEL} from '../../../../../config/ticket'
import {mergeCustomers} from '../../../../../state/customers/actions.ts'
import MergeCustomersModal from '../MergeCustomersModal'

const address1 = 'pierre@gorgias.io'
const address2 = 'Pierre@gorgias.io'

const customer1 = fromJS({
    id: 1,
    data: {},
    channels: [
        {
            type: EMAIL_CHANNEL,
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
            type: EMAIL_CHANNEL,
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
            const component = shallow(
                <MergeCustomersModal
                    destinationCustomer={customer1}
                    sourceCustomer={customer2}
                    mergeCustomers={mergeCustomers}
                    toggleModal={_noop}
                    onSuccess={_noop}
                    isOpen={true}
                    isLoadin={false}
                    primaryEmail={address1}
                    requiredAddresses={fromJS([address1])}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
