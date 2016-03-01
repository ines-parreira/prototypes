import React, {PropTypes} from 'react'
import 'moment-timezone'
import UserForm from './UserForm'

export default class UserRow extends React.Component {
    openNewUserForm = () => {
        const modalId = '#userform-' + this.props.user.id
        $(modalId).modal('show')
    }

    render() {
        let label
        const { user } = this.props

        if (!user) {
            return null
        }

        if (user.roles.indexOf('admin') !== -1) {
            label = <div className="ui red label">ADMIN</div>
        } else if (user.roles.indexOf('agent') !== -1) {
            label = <div className="ui blue label">AGENT</div>
        } else {
            label = <div className="ui green label">USER</div>
        }

        return (
            <div className="ui grid no-margin">
                <UserForm
                    user={this.props.user}
                />
                <div className="UserRow row">
                    <div className="one wide column collapsing">
                        <span className="ui checkbox">
                            <input type="checkbox"/>
                            <label></label>
                        </span>
                    </div>
                    <div className="two wide column">
                        {label}
                    </div>
                    <div className="eight wide column details">
                        <div className="ui header">
                            <span
                                className="subject">{user.name}</span>
                            <div className="body sub header">
                                {user.email}
                            </div>
                        </div>
                    </div>
                    <div className="five wide column">
                        <button className="ui button right">
                            Delete
                        </button>
                        <button className="ui button right" onClick={this.openNewUserForm}>
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
    key: PropTypes.string
}
