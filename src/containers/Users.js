import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import DocumentTitle from 'react-document-title'
import * as UserActions from '../actions/user'
import * as SettingsActions from '../actions/settings'
import UsersView from '../components/user/UsersView'
import { buildQuery } from './../reducers/users'


class UsersContainer extends React.Component {
    componentWillReceiveProps(nextProps) {
        if (!this.props.users.get('sort').equals(nextProps.users.get('sort'))) {
            this._search(
                '',
                this.props.users.getIn(['search', 'params']),
                this.props.users.getIn(['search', 'stringQuery']),
                nextProps.users.get('sort')
            )
        }
    }

    _search = (query, params, stringQuery, sort = this.props.users.get('sort')) => {
        this.props.actions.user.search(buildQuery(stringQuery, sort), params, stringQuery)
    }

    render() {
        const {users} = this.props

        if (!users.get('items')) {
            return null
        }

        return (
            <DocumentTitle title="Users">
                <div className="UsersContainer">
                    <UsersView
                        items={users.get('items')}
                        sort={users.get('sort')}
                        stringQuery={users.get('stringQuery')}
                        search={this._search}
                        isLoading={users.get('loading')}
                        createUser={this.props.actions.user.createUser}
                        updateUser={this.props.actions.user.updateUser}
                        deleteUser={this.props.actions.user.deleteUser}
                        sortUsers={this.props.actions.user.sortUsers}
                    />
                </div>
            </DocumentTitle>
        )
    }
}

UsersContainer.propTypes = {
    users: PropTypes.object,
    currentUser: PropTypes.object,
    settings: PropTypes.object,
    actions: PropTypes.object.isRequired,

    // React Router
    params: PropTypes.object
}

UsersContainer.childContextTypes = {
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
