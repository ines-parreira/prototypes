import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import DocumentTitle from 'react-document-title'
import * as UserActions from '../../../state/users/actions'
import * as SettingsActions from '../../../state/settings/actions'
import UsersView from './components/UsersView'
import {buildQuery} from '../../../state/users/utils'

class UserListContainer extends React.Component {
    componentDidMount() {
        amplitude.getInstance().logEvent('Opened users view')
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.users.getIn(['_internal', 'sort']).equals(nextProps.users.getIn(['_internal', 'sort']))) {
            this._search(
                '',
                this.props.users.getIn(['_internal', 'search', 'params']),
                this.props.users.getIn(['_internal', 'search', 'stringQuery']),
                nextProps.users.getIn(['_internal', 'sort'])
            )
        }
    }

    _search = (query, params, stringQuery, sort = this.props.users.getIn(['_internal', 'sort'])) => {
        this.props.actions.user.search(buildQuery(stringQuery, sort), params, stringQuery)
    }

    render() {
        const {users} = this.props

        if (!users.get('items')) {
            return null
        }

        return (
            <DocumentTitle title="Users">
                <div className="UserListContainer">
                    <UsersView
                        items={users.get('items')}
                        sort={users.getIn(['_internal', 'sort'])}
                        search={this._search}
                        isLoading={users.getIn(['_internal', 'loading', 'fetchList'], false)}
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

UserListContainer.propTypes = {
    users: PropTypes.object,
    currentUser: PropTypes.object,
    settings: PropTypes.object,
    actions: PropTypes.object.isRequired,

    // React Router
    params: PropTypes.object
}

UserListContainer.childContextTypes = {}

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

export default connect(mapStateToProps, mapDispatchToProps)(UserListContainer)
