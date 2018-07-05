import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {mergeCustomers} from '../../../../state/customers/actions'
import MergeUsersModal from './MergeUsersModal'

import {makeIsLoading} from '../../../../state/customers/selectors'
import {getMessages} from './../../../../state/ticket/selectors'

class MergeUsersContainer extends React.Component {
    render() {
        const {
            destinationUser,
            sourceUser,
            display,
            mergeCustomers,
            onClose,
            usersIsLoading,
            isTicketContext,
            ticketMessages,
            onSuccess,
        } = this.props

        if (!destinationUser || destinationUser.isEmpty()) {
            return null
        }

        if (!sourceUser || sourceUser.isEmpty()) {
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
            <MergeUsersModal
                isOpen={display}
                destinationUser={destinationUser}
                sourceUser={sourceUser}
                toggleModal={onClose}
                mergeCustomers={mergeCustomers}
                isLoading={usersIsLoading('merge')}
                requiredAddresses={fromJS(requiredAddresses).toSet().filter((address) => address)}
                onSuccess={onSuccess}
            />
        )
    }
}

MergeUsersContainer.defaultProps = {
    display: false,
    isLoading: false,
    isTicketContext: false
}

MergeUsersContainer.propTypes = {
    destinationUser: PropTypes.object.isRequired,
    sourceUser: PropTypes.object.isRequired,
    display: PropTypes.bool.isRequired,
    mergeCustomers: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    usersIsLoading: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,

    isTicketContext: PropTypes.bool.isRequired,
    ticketMessages: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        usersIsLoading: makeIsLoading(state),
        ticketMessages: getMessages(state)
    }
}

export default connect(mapStateToProps, {mergeCustomers})(MergeUsersContainer)
