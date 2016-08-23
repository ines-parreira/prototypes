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
                    User={this.props.User}
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

    User: PropTypes.object,
    currentUser: PropTypes.object,

    actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    return {
        User: state.User,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(UserActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDetailContainer)
