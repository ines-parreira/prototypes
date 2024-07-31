import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'

import {SegmentEvent, logEvent} from 'common/segment'
import InfobarCustomerActions from '../InfobarCustomerActions'

jest.mock('utils', () => ({
    isCurrentlyOnTicket: (ticketId: Maybe<string | number>) => !!ticketId,
}))

jest.mock(
    'common/segment',
    () =>
        ({
            ...jest.requireActual('common/segment'),
            logEvent: jest.fn(),
        } as Record<string, unknown>)
)

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
    toggleMergeCustomerModal: jest.fn(),
    setCustomer: () => null,
}

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

    it("should call `toggleMergeCustomerModal` and `logEvent` when the 'merge' button is clicked", () => {
        render(<InfobarCustomerActions {...commonProps} />)
        screen.getByText('Merge').click()

        expect(commonProps.toggleMergeCustomerModal).toHaveBeenCalledWith(true)
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.CustomerMergeClicked,
            expect.objectContaining({
                location: 'search',
            })
        )
    })
})
