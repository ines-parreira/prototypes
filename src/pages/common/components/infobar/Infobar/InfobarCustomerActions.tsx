import React from 'react'
import {fromJS, Map} from 'immutable'
import {Button} from 'reactstrap'

import {isCurrentlyOnTicket} from '../../../../../utils'
import ConfirmButton from '../../ConfirmButton'

import {
    logEvent,
    SegmentEvent,
} from '../../../../../store/middlewares/segmentTracker'

type Props = {
    customer: Map<any, any>
    sources: Map<any, any>
    selectedCustomer: Map<any, any>
    toggleMergeCustomerModal: (toggle: boolean) => void
    setCustomer: () => void
}

export default class InfobarCustomerActions extends React.Component<Props> {
    render() {
        const {
            sources,
            customer,
            selectedCustomer,
            toggleMergeCustomerModal,
            setCustomer,
        } = this.props

        const ticketId = sources.getIn(['ticket', 'id'])
        const customerName: string =
            sources.getIn(['ticket', 'customer', 'name']) || ''
        const hasCustomer = !(
            (sources.getIn(['ticket', 'customer']) || fromJS({})) as Map<
                any,
                any
            >
        ).isEmpty()
        const newCustomer: string = selectedCustomer.get('name') || ''
        const hasDestinationCustomer = !customer.isEmpty()

        const isDifferentCustomer =
            hasDestinationCustomer &&
            selectedCustomer.get('id') !== customer.get('id')
        const canSetAsCustomer =
            isCurrentlyOnTicket(ticketId) &&
            (isDifferentCustomer || !hasDestinationCustomer)

        const message = hasCustomer
            ? `Are you sure you want to set ${newCustomer} as customer instead of ${customerName}?`
            : `Are you sure you want to set ${newCustomer} as customer?`

        return (
            <div className="float-right d-none d-md-block">
                {canSetAsCustomer ? ( // do not display on customer profile
                    <ConfirmButton
                        className="mr-2"
                        title="Change ticket customer"
                        content={message}
                        confirm={setCustomer}
                    >
                        Set as customer
                    </ConfirmButton>
                ) : null}
                {isDifferentCustomer ? (
                    <Button
                        type="submit"
                        onClick={() => {
                            toggleMergeCustomerModal(true)
                            // TODO(customers-migration): ask confirmation to update this event
                            logEvent(SegmentEvent.UserMergeClicked, {
                                location: 'user searched in infobar',
                            })
                        }}
                    >
                        Merge
                    </Button>
                ) : null}
            </div>
        )
    }
}
