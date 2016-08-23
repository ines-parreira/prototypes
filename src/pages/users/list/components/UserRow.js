import React, {PropTypes} from 'react'
import UserForm from './UserForm'

export default class UserRow extends React.Component {
    deleteUser(userName, userId) {
        if (window.confirm(`Are you sure you want to delete user ${userName}?`)) {
            this.props.deleteUser(userId)
        }
    }

    render() {
        const {user, updateUser} = this.props

        let label
        const userRoles = []

        user.get('roles').map((v) => userRoles.push(v.get('name')))

        if (userRoles && ~userRoles.indexOf('admin')) {
            label = <div className="ui blue label">ADMIN</div>
        } else if (userRoles && ~userRoles.indexOf('agent')) {
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
                            <input type="checkbox" />
                            <label></label>
                        </span>
                    </div>
                    <div className="eight wide column details">
                        <div className="ui header">
                            <span className="subject">{user.get('name')}</span>
                            <div className="body sub header">
                                {user.get('email')}
                            </div>
                        </div>
                    </div>
                    <div className="two wide column">
                        {label}
                    </div>
                    <div className="five wide column">
                        <button
                            className="ui inverted red basic button right"
                            onClick={() => {
                                this.deleteUser(user.get('name'), user.get('id'))
                            }}
                        >
                            Delete
                        </button>
                        <button
                            className="ui inverted blue basic button right"
                            onClick={() => {
                                $(`#userform-${user.get('id')}`).modal('show')
                            }}
                        >
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
    }),

    updateUser: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired
}
