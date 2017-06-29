import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as UsersActions from './../../../../state/users/actions'
import * as InfobarActions from './../../../../state/infobar/actions'
import MergeUsersModal from './MergeUsersModal'

import {makeIsLoading} from './../../../../state/users/selectors'
import {getMessages} from './../../../../state/ticket/selectors'

class MergeUsersContainer extends React.Component {
    render() {
        const {
            destinationUser,
            sourceUser,
            display,
            actions,
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
                mergeUsers={actions.users.mergeUsers}
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
    actions: PropTypes.object.isRequired,
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

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            infobar: bindActionCreators(InfobarActions, dispatch),
            users: bindActionCreators(UsersActions, dispatch)
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MergeUsersContainer)
