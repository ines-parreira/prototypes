import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {mergeCustomers} from '../../../../state/customers/actions'
import MergeCustomersModal from './MergeCustomersModal'

import {makeIsLoading} from '../../../../state/customers/selectors'
import {getMessages} from './../../../../state/ticket/selectors'

class MergeCustomersContainer extends React.Component {
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

        const requiredAddresses = []

        if (isTicketContext && ticketMessages) {
            ticketMessages.forEach((message) => {
                requiredAddresses.push(message.getIn(['source', 'from', 'address'], null))

                message.getIn(['source', 'to'], fromJS([])).forEach((sourceField) => {
                    requiredAddresses.push(sourceField.get('address', null))
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
                requiredAddresses={fromJS(requiredAddresses).toSet().filter((address) => address)}
                onSuccess={onSuccess}
            />
        )
    }
}

MergeCustomersContainer.defaultProps = {
    display: false,
    isLoading: false,
    isTicketContext: false
}

MergeCustomersContainer.propTypes = {
    destinationCustomer: PropTypes.object.isRequired,
    sourceCustomer: PropTypes.object.isRequired,
    display: PropTypes.bool.isRequired,
    mergeCustomers: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    customersIsLoading: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,

    isTicketContext: PropTypes.bool.isRequired,
    ticketMessages: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        customersIsLoading: makeIsLoading(state),
        ticketMessages: getMessages(state)
    }
}

export default connect(mapStateToProps, {mergeCustomers})(MergeCustomersContainer)
