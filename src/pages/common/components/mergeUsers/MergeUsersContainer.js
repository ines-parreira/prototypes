import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as UsersActions from './../../../../state/users/actions'
import * as InfobarActions from './../../../../state/infobar/actions'
import MergeUsersModal from './MergeUsersModal'

import {makeIsLoading} from './../../../../state/users/selectors'

class MergeUsersContainer extends React.Component {
    render() {
        const {destinationUser, sourceUser, display, actions, usersIsLoading} = this.props

        if (!destinationUser || destinationUser.isEmpty()) {
            return null
        }

        if (!sourceUser || sourceUser.isEmpty()) {
            return null
        }

        return (
            <MergeUsersModal
                isOpen={display}
                destinationUser={destinationUser}
                sourceUser={sourceUser}
                toggleModal={actions.infobar.toggleMergeUsersModal}
                mergeUsers={actions.users.mergeUsers}
                isLoading={usersIsLoading('merge')}
            />
        )
    }
}

MergeUsersContainer.defaultProps = {
    display: false,
    isLoading: false
}

MergeUsersContainer.propTypes = {
    destinationUser: PropTypes.object.isRequired,
    sourceUser: PropTypes.object.isRequired,
    display: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    usersIsLoading: PropTypes.func.isRequired
}

function mapStateToProps(state) {
    return {
        usersIsLoading: makeIsLoading(state),
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
