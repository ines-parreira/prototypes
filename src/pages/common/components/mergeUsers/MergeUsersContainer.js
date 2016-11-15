import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as UsersActions from './../../../../state/users/actions'
import * as InfobarActions from './../../../../state/infobar/actions'
import MergeUsersModal from './MergeUsersModal'

class MergeUsersContainer extends React.Component {
    render() {
        const {destinationUser, sourceUser, display, actions, isLoading} = this.props

        if (!display) {
            return null
        }

        return (
            <MergeUsersModal
                destinationUser={destinationUser}
                sourceUser={sourceUser}
                toggleModal={actions.infobar.toggleMergeUsersModal}
                mergeUsers={actions.users.mergeUsers}
                isLoading={isLoading}
            />
        )
    }
}

MergeUsersContainer.propTypes = {
    destinationUser: PropTypes.object.isRequired,
    sourceUser: PropTypes.object.isRequired,
    display: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired
}

function mapStateToProps(state) {
    return {
        isLoading: state.users.getIn(['_internal', 'loading', 'merge'])
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
