import React, {PropTypes} from 'react'
import {Loader} from '../Loader'
import UserRow from './UserRow'

export default class UserList extends React.Component {
    sort = (sortField) => {
        if (this.props.sort.get('field') === sortField) {
            this.props.sortUsers(sortField, this.props.sort.get('direction') === 'asc' ? 'desc' : 'asc')
        } else {
            this.props.sortUsers(sortField, 'desc')
        }
    }

    getSortIconClassNames(sortField) {
        if (sortField === this.props.sort.get('field')) {
            return this.props.sort.get('direction') === 'asc' ? 'caret up action icon' : 'caret down action icon'
        }

        return 'sort action icon'
    }

    render() {
        const {items, isLoading} = this.props

        if (items.isEmpty()) {
            const message = <p>{isLoading ? 'Loading...' : 'No users found.'}</p>
            return (
                <Loader message={message} loading={isLoading}/>
            )
        }

        return (
            <div className="UserList">
                <div className="ui grid">
                    <div className="row head-row">
                        <div className="one wide column">
                            <span className="ui checkbox">
                                <input type="checkbox"/>
                                <label></label>
                            </span>
                        </div>
                        <div className="eight wide column">
                            USERS
                            <i id="users-name-sort"
                               className={this.getSortIconClassNames('name')}
                               onClick={() => { this.sort('name') }}
                            />
                        </div>
                        <div className="two wide column">
                            ROLE
                            <i id="users-role-sort"
                               className={this.getSortIconClassNames('roles.name')}
                               onClick={() => { this.sort('roles.name') }}
                            />
                        </div>
                    </div>
                </div>
                <div className="ui divided items">
                    {items.map((user) => (
                        <UserRow
                            key={user.get('id')}
                            user={user}
                            updateUser={this.props.updateUser}
                            deleteUser={this.props.deleteUser}
                        />
                    ))}
                </div>
            </div>
        )
    }
}

UserList.propTypes = {
    items: PropTypes.object.isRequired,
    sort: PropTypes.object.isRequired,
    isLoading: PropTypes.bool,

    updateUser: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired,
    sortUsers: PropTypes.func.isRequired
}
