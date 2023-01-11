import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import InfobarCustomerActions from '../InfobarCustomerActions'

const commonProps: ComponentProps<typeof InfobarCustomerActions> = {
    customer: fromJS({
        id: 1,
    }),
    sources: fromJS({
        customer: {
            id: 1,
        },
        ticket: {
            id: 2,
        },
    }),
    selectedCustomer: fromJS({
        id: 3,
    }),
    toggleMergeCustomerModal: () => null,
    setCustomer: () => null,
}

jest.mock('../../../../../../utils', () => ({
    isCurrentlyOnTicket: (ticketId: Maybe<string | number>) => !!ticketId,
}))

describe('InfobarCustomerActions component', () => {
    it('should not render "set as customer" button because the agent is not on a ticket', () => {
        const component = shallow(
            <InfobarCustomerActions
                {...commonProps}
                sources={fromJS({
                    customer: {
                        id: 1,
                    },
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not render "set as customer" nor "merge" buttons because the customers are the same', () => {
        const component = shallow(
            <InfobarCustomerActions
                {...commonProps}
                selectedCustomer={commonProps.customer}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not render "merge" button because there is no customer to merge the selected customer with', () => {
        const component = shallow(
            <InfobarCustomerActions {...commonProps} customer={fromJS({})} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render "set as customer" and "merge" button', () => {
        const component = shallow(<InfobarCustomerActions {...commonProps} />)

        expect(component).toMatchSnapshot()
    })
})
