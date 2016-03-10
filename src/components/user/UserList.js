import React, {PropTypes} from 'react'

import UserRow from './UserRow'

export default class UserList extends React.Component {
    render() {
        const { items } = this.props
        const { sortUsers } = this.context

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
                        <div className="two wide column">
                            Role
                            <i id="users-role-sort" className="sort action icon" onClick={() => {sortUsers('roles')}}></i>
                        </div>
                        <div className="eight wide column">
                            User
                            <i id="users-name-sort" className="sort action icon" onClick={() => {sortUsers('name')}}></i>
                        </div>
                    </div>
                </div>
                <div className="ui divided items">
                    {items.map((user) => {
                        return (
                            <UserRow
                                key={user.id}
                                user={user}
                            />
                        )
                    })}
                </div>
            </div>
        )
    }
}

UserList.propTypes = {
    items: PropTypes.array.isRequired
}

UserList.contextTypes = {
    sortUsers: PropTypes.func.isRequired
}
