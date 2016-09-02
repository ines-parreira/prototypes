import React, {PropTypes} from 'react'
import UserList from './UserList'
import Search from '../../../common/components/Search'
import UserForm from './UserForm'
import {USER_SEARCH_QUERY, USER_SEARCH_QUERY_PATH} from '../../../../state/users/utils'

export default class UsersView extends React.Component {
    render() {
        const {items, isLoading, sort, createUser} = this.props

        return (
            <div className="UsersView">
                <div className="ui text menu">
                    <div className="right menu item">
                        <div className="item">
                            <Search
                                autofocus
                                onChange={this.props.search}
                                className="long"
                                queryPath={USER_SEARCH_QUERY_PATH}
                                query={USER_SEARCH_QUERY}
                                placeholder="Search users"
                                searchDebounceTime={400}
                            />
                        </div>
                    </div>
                </div>

                <div className="ui grid view-header">
                    <div className="thirteen wide column">
                        <h1 className="ui header">Users</h1>
                    </div>
                    <div className="three wide column">
                        <UserForm
                            onSubmit={createUser}
                        />
                        <button
                            className="ui right floated green button"
                            onClick={() => {
                                $('#userform-new').modal('show')
                            }}
                        >
                            ADD USER
                        </button>
                    </div>
                </div>
                <UserList
                    items={items}
                    isLoading={isLoading}
                    sort={sort}
                    updateUser={this.props.updateUser}
                    deleteUser={this.props.deleteUser}
                    sortUsers={this.props.sortUsers}
                />
            </div>
        )
    }
}

UsersView.propTypes = {
    items: PropTypes.object.isRequired,
    sort: PropTypes.object.isRequired,
    stringQuery: PropTypes.string.isRequired,
    search: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,

    createUser: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired,
    sortUsers: PropTypes.func.isRequired
}
