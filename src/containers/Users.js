import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { bindActionCreators } from 'redux'

import * as UserActions from '../actions/user'
import UsersView from '../components/user/UsersView'


class UsersContainer extends React.Component {
    componentWillMount() {
        this.props.actions.fetchUsers()
    }

    submitNewUser = (data) => {
        this.props.actions.createUser(data)
    }

    updateUser = (data, userId) => {
        this.props.actions.updateUser(data, userId)
    }

    deleteUser = (userId) => {
        this.props.actions.deleteUser(userId)
    }

    render() {
        return (
            <div className="UsersContainer">
                <UsersView
                    items={this.props.users.get('items')}
                    currentUser={this.props.currentUser}
                    isLoading={this.props.users.get('loading')}
                    createUser={this.submitNewUser}
                    updateUser={this.updateUser}
                    deleteUser={this.deleteUser}
                />
            </div>
        )
    }
}

UsersContainer.propTypes = {
    users: PropTypes.shape({
        get: PropTypes.func,
        loading: PropTypes.bool,
        items: PropTypes.array,
        resp: PropTypes.shape({
            meta: PropTypes.object,
            data: PropTypes.array,
            uri: PropTypes.string,
            object: PropTypes.string
        })
    }),
    currentUser: PropTypes.object,
    actions: PropTypes.object.isRequired,

    // React Router
    params: PropTypes.object
}

function mapStateToProps(state) {
    return {
        users: state.users,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(UserActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersContainer)
