import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

import * as UserActions from '../../../state/users/actions'
import UserView from '../list/components/UsersView'

/**
 * NOT WORKING
 */
class UserDetailContainer extends React.Component {
    componentWillMount() {
        this.props.actions.fetchUser(this.props.params.userId)
    }

    render() {
        return (
            <div className="UserDetailContainer">
                <UserView
                    user={this.props.user}
                    currentUser={this.props.currentUser}
                    update={this.update}
                    submit={this.submit}
                />
            </div>
        )
    }
}

UserDetailContainer.propTypes = {
    params: PropTypes.shape({
        userId: PropTypes.string
    }).isRequired,

    user: PropTypes.object,
    currentUser: PropTypes.object,

    actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    return {
        user: state.user,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(UserActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDetailContainer)
