import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as UserActions from '../actions/user'
import * as SettingsActions from '../actions/settings'
import UsersView from '../components/user/UsersView'
import { loadSearch } from '../utils'


class UsersContainer extends React.Component {
    getChildContext() {
        return {
            createUser: this.props.actions.user.createUser,
            updateUser: this.props.actions.user.updateUser,
            deleteUser: this.props.actions.user.deleteUser,
            sortUsers: this.props.actions.user.sortUsers
        }
    }

    componentDidMount() {
        if (this.props.settings.get('loaded')) {
            this.loadSearch(this.props, 'user', 'user', this.props.actions.user.updateList, 20)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.settings.get('loaded') && !nextProps.settings.get('searchLoaded').get('user')) {
            loadSearch(nextProps, 'user', 'user', nextProps.actions.user.updateList, 20)
        }
    }

    render() {
        const { users } = this.props

        if (!users) {
            return null
        }

        return (
            <div className="UsersContainer">
                <UsersView
                    items={users.get('items').toJS()}
                    isLoading={users.get('loading')}
                />
            </div>
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
