import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { bindActionCreators } from 'redux'

import * as UserActions from '../actions/user'
import UsersView from '../components/user/UsersView'


class UsersContainer extends React.Component {
    getChildContext() {
        return {
            createUser: this.props.actions.createUser,
            updateUser: this.props.actions.updateUser,
            deleteUser: this.props.actions.deleteUser,
            updateForm: this.props.actions.updateForm
        }
    }

    componentWillMount() {
        this.props.actions.fetchUsers()
    }

    render() {
        const { users } = this.props

        if (!users) {
            return null
        }

        return (
            <div className="UsersContainer">
                <UsersView
                    items={users.get('items')}
                    form={users.get('form')}
                    isLoading={users.get('loading')}
                />
            </div>
        )
    }
}

UsersContainer.propTypes = {
    users: PropTypes.shape({
        loading: PropTypes.bool,
        items: PropTypes.array,
        form: PropTypes.shape({
            name: PropTypes.string,
            email: PropTypes.string,
            role: PropTypes.string
        }),
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

UsersContainer.childContextTypes = {
    createUser: PropTypes.func,
    updateUser: PropTypes.func,
    deleteUser: PropTypes.func,
    updateForm: PropTypes.func
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
