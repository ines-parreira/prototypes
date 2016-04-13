import React, { PropTypes } from 'react'
import 'moment-timezone'
import UserForm from './UserForm'

export default class UserRow extends React.Component {
    render() {
        const { user } = this.props
        const { updateUser, deleteUser } = this.context

        let label
        const userRoles = []

        _.each(user.roles, (v) => {
            userRoles.push(v.name)
        })

        if (userRoles && userRoles.indexOf('admin') !== -1) {
            label = <div className="ui blue label">ADMIN</div>
        } else if (userRoles && userRoles.indexOf('agent') !== -1) {
            label = <div className="ui yellow label">AGENT</div>
        } else {
            label = <div className="ui grey label">USER</div>
        }

        return (
            <div className="ui grid no-margin">
                <UserForm
                    user={user}
                    onSubmit={updateUser}
                />
                <div className="UserRow row">
                    <div className="one wide column collapsing">
                        <span className="ui checkbox">
                            <input type="checkbox"/>
                            <label></label>
                        </span>
                    </div>
                    <div className="eight wide column details">
                        <div className="ui header">
                            <span className="subject">{user.name}</span>
                            <div className="body sub header">
                                {user.email}
                            </div>
                        </div>
                    </div>
                    <div className="two wide column">
                        {label}
                    </div>
                    <div className="five wide column">
                        <button className="ui inverted red basic button right" onClick={() => {deleteUser(user.id)}}>
                            Delete
                        </button>
                        <button className="ui inverted blue basic button right" onClick={() => {$('#userform-' + user.id).modal('show')}}>
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

UserRow.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.integer,
        roles: PropTypes.array,
        name: PropTypes.string,
        email: PropTypes.string,
        language: PropTypes.string,
        country: PropTypes.string
    })
}

UserRow.contextTypes = {
    updateUser: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired
}
