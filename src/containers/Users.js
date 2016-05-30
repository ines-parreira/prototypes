import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import DocumentTitle from 'react-document-title'
import * as UserActions from '../actions/user'
import * as SettingsActions from '../actions/settings'
import UsersView from '../components/user/UsersView'

class UsersContainer extends React.Component {
    getChildContext() {
        return {
            createUser: this.props.actions.user.createUser,
            updateUser: this.props.actions.user.updateUser,
            deleteUser: this.props.actions.user.deleteUser,
            sortUsers: this.props.actions.user.sortUsers
        }
    }

    componentWillMount() {
        this.props.actions.user.fetchUsers()
    }

    search = (query, params, stringQuery) => {
        if (!stringQuery) {
            this.props.actions.user.fetchUsers()
        } else {
            // populate users state from search results now
            this.props.actions.user.search(query, params)
        }
    }

    render() {
        const {users} = this.props

        if (!users) {
            return null
        }

        return (
            <DocumentTitle title="Users">
                <div className="UsersContainer">
                    <UsersView
                        items={users.get('items').toJS()}
                        search={this.search}
                        isLoading={users.get('loading')}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

UsersContainer.propTypes = {
    users: PropTypes.shape({
        loading: PropTypes.bool,
        items: PropTypes.object,
        resp: PropTypes.shape({
            meta: PropTypes.object,
            data: PropTypes.array,
            uri: PropTypes.string,
            object: PropTypes.string
        })
    }),
    currentUser: PropTypes.object,
    settings: PropTypes.object,
    actions: PropTypes.object.isRequired,

    // React Router
    params: PropTypes.object
}

UsersContainer.childContextTypes = {
    createUser: PropTypes.func,
    updateUser: PropTypes.func,
    deleteUser: PropTypes.func,
    sortUsers: PropTypes.func
}

function mapStateToProps(state) {
    return {
        users: state.users,
        currentUser: state.currentUser,
        settings: state.settings
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            user: bindActionCreators(UserActions, dispatch),
            settings: bindActionCreators(SettingsActions, dispatch)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersContainer)
