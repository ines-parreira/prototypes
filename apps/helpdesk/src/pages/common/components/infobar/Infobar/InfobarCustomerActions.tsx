import { fromJS, Map } from 'immutable'

import { LegacyButton as Button } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import { isCurrentlyOnTicket } from 'utils'

type Props = {
    customer: Map<any, any>
    sources: Map<any, any>
    selectedCustomer: Map<any, any>
    toggleMergeCustomerModal: (toggle: boolean) => void
    setCustomer: () => void
}

export default function InfobarCustomerActions({
    sources,
    customer,
    selectedCustomer,
    toggleMergeCustomerModal,
    setCustomer,
}: Props) {
    const ticketId = sources.getIn(['ticket', 'id'])
    const customerName: string =
        sources.getIn(['ticket', 'customer', 'name']) || ''
    const hasCustomer = !(
        (sources.getIn(['ticket', 'customer']) || fromJS({})) as Map<any, any>
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
                    confirmationTitle="Change ticket customer"
                    confirmationContent={message}
                    intent="secondary"
                    onConfirm={setCustomer}
                >
                    Set as customer
                </ConfirmButton>
            ) : null}
            {isDifferentCustomer ? (
                <Button
                    intent="secondary"
                    onClick={() => {
                        toggleMergeCustomerModal(true)
                        logEvent(SegmentEvent.CustomerMergeClicked, {
                            location: 'search',
                            account_domain:
                                window.GORGIAS_STATE.currentAccount.domain,
                            user_id:
                                window.GORGIAS_STATE.currentAccount.user_id,
                            timestamp: Date.now(),
                        })
                    }}
                >
                    Merge
                </Button>
            ) : null}
        </div>
    )
}
