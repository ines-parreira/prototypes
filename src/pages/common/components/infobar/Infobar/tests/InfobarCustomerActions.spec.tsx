import {render} from '@testing-library/react'
import React, {ComponentProps} from 'react'
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
        const {container} = render(
            <InfobarCustomerActions
                {...commonProps}
                sources={fromJS({
                    customer: {
                        id: 1,
                    },
                })}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render "set as customer" nor "merge" buttons because the customers are the same', () => {
        const {container} = render(
            <InfobarCustomerActions
                {...commonProps}
                selectedCustomer={commonProps.customer}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render "merge" button because there is no customer to merge the selected customer with', () => {
        const {container} = render(
            <InfobarCustomerActions {...commonProps} customer={fromJS({})} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render "set as customer" and "merge" button', () => {
        const {container} = render(<InfobarCustomerActions {...commonProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
