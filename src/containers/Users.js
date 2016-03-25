import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { bindActionCreators } from 'redux'

import * as UserActions from '../actions/user'
import * as SettingsActions from '../actions/settings'
import UsersView from '../components/user/UsersView'

import instantsearch from 'instantsearch.js'


class UsersContainer extends React.Component {
    getChildContext() {
        return {
            createUser: this.props.actions.createUser,
            updateUser: this.props.actions.updateUser,
            deleteUser: this.props.actions.deleteUser,
            sortUsers: this.props.actions.sortUsers
        }
    }

    componentDidMount() {
        if (this.props.settings.get('loaded')) {
            this.loadSearch(this.props)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.settings.get('loaded') && !nextProps.settings.get('searchLoaded').get('user')) {
            this.loadSearch(nextProps)
        }
    }

    loadSearch(props) {
        function searchResults({ updateMethod }) {
            return {
                render({ results }) {
                    updateMethod(results.hits)
                }
            }
        }

        const search = instantsearch({
            appId: props.settings.get('data').get('algolia_app_name'),
            apiKey: props.settings.get('data').get('algolia_api_key'),
            indexName: props.settings.get('data').get('indices_names').get('user')
        })

        search.addWidget(
            instantsearch.widgets.searchBox({
                container: document.querySelector('#search-user')
            })
        )

        search.addWidget(
            searchResults({
                updateMethod: props.actions.updateList
            })
        )

        props.settingsActions.loadedSearch('user')
        search.start()
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
    settingsActions: PropTypes.object.isRequired,

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
        actions: bindActionCreators(UserActions, dispatch),
        settingsActions: bindActionCreators(SettingsActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersContainer)
