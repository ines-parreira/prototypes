import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'

import * as UserActions from '../actions/user'
import UserView from '../components/user/UsersView'


class UserContainer extends React.Component {
    componentWillMount() {
        this.props.actions.fetchUser(this.props.params.userId)
    }

    render() {
        return (
            <div className="UserContainer">
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

UserContainer.propTypes = {
    params: PropTypes.shape({
        UserId: PropTypes.string
    }).isRequired,

    User: PropTypes.object,
    currentUser: PropTypes.object,

    actions: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired
}

function mapStateToProps(state) {
    return {
        User: state.User,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(UserActions, dispatch),
        pushState: bindActionCreators(pushState, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserContainer)
