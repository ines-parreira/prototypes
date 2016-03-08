import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { bindActionCreators } from 'redux'

import * as UserActions from '../actions/user'
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

    componentWillMount() {
        this.props.actions.fetchUsers()
    }

    componentDidMount() {
        function searchResults({updateMethod}) {
            return {
                render({results}) {
                    updateMethod(results.hits)
                }
            }
        }

        const search = instantsearch({
            appId: 'G5FVFFNP0F',
            apiKey: '1410ae780124bd574d8f28ef301e3df4',
            indexName: 'dev_user_gorgias'
        })

        // add a searchBox
        search.addWidget(
            instantsearch.widgets.searchBox({
                container: document.querySelector('#user-search'),
                placeholder: 'iphone...'
            })
        )

        // add a bestResult widget
        search.addWidget(
            searchResults({
                updateMethod: this.props.actions.updateList
            })
        )

        search.start()
    }

    render() {
        const { users } = this.props

        if (!users) {
            return null
        }

        return (
            <div className="UsersContainer">
                <div id="results-container">
                </div>
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
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(UserActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersContainer)
