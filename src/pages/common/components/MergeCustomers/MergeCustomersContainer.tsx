import React, {Component} from 'react'
import {fromJS, List, Map, Set} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import {makeIsLoading} from '../../../../state/customers/selectors'
import {getMessages} from '../../../../state/ticket/selectors'
import {mergeCustomers} from '../../../../state/customers/actions'
import {RootState} from '../../../../state/types'

import MergeCustomersModal from './MergeCustomersModal'

type Props = ConnectedProps<typeof connector> & {
    destinationCustomer: Map<any, any>
    sourceCustomer: Map<any, any>
    display: boolean
    onClose: () => void
    onSuccess: () => void
    isTicketContext: boolean
}

class MergeCustomersContainer extends Component<Props> {
    static defaultProps: Pick<Props, 'display' | 'isTicketContext'> = {
        display: false,
        isTicketContext: false,
    }

    render() {
        const {
            destinationCustomer,
            sourceCustomer,
            display,
            mergeCustomers,
            onClose,
            customersIsLoading,
            isTicketContext,
            ticketMessages,
            onSuccess,
        } = this.props

        if (!destinationCustomer || destinationCustomer.isEmpty()) {
            return null
        }

        if (!sourceCustomer || sourceCustomer.isEmpty()) {
            return null
        }

        const requiredAddresses: Array<string | null> = []

        if (isTicketContext && ticketMessages) {
            ticketMessages.forEach((message) => {
                requiredAddresses.push(
                    (message as Map<any, any>).getIn(
                        ['source', 'from', 'address'],
                        null
                    )
                )
                ;((message as Map<any, any>).getIn(
                    ['source', 'to'],
                    fromJS([])
                ) as List<Map<any, any>>).forEach((sourceField) => {
                    requiredAddresses.push(
                        (sourceField as Map<any, any>).get('address', null) as
                            | string
                            | null
                    )
                })
            })
        }

        return (
            <MergeCustomersModal
                isOpen={display}
                destinationCustomer={destinationCustomer}
                sourceCustomer={sourceCustomer}
                toggleModal={onClose}
                mergeCustomers={mergeCustomers}
                isLoading={customersIsLoading('merge')}
                requiredAddresses={
                    (fromJS(requiredAddresses) as List<string>)
                        .toSet()
                        .filter(
                            (address: string | undefined) => !!address
                        ) as Set<string>
                }
                onSuccess={onSuccess}
            />
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        customersIsLoading: makeIsLoading(state),
        ticketMessages: getMessages(state),
    }),
    {mergeCustomers}
)

export default connector(MergeCustomersContainer)
