import React, {PropTypes} from 'react'
import 'moment-timezone'
import UserForm from './UserForm'

export default class UserRow extends React.Component {
    constructor(props) {
        super(props)

        if (this.props.user) {
            const label = this.rolesToLabel(this.props.user.roles)

            this.state = {
                name: this.props.user.name,
                email: this.props.user.email,
                label: label
            }
        }
    }

    onSubmit = (data, userId) => {
        if (data.name) {
            this.setState({name: data.name})
        }

        if (data.email) {
            this.setState({email: data.email})
        }

        if (data.role) {
            this.setState({label: this.rolesToLabel([data.role])})
        }

        this.props.onSubmit(data, userId)
    }

    openEditUserForm = () => {
        const modalId = '#userform-' + this.props.user.id
        $(modalId).modal('show')
    }

    rolesToLabel = (roles) => {
        let label

        if (roles.indexOf('admin') !== -1) {
            label = <div className="ui red label">ADMIN</div>
        } else if (roles.indexOf('agent') !== -1) {
            label = <div className="ui blue label">AGENT</div>
        } else {
            label = <div className="ui green label">USER</div>
        }

        return label
    }

    render() {
        if (!this.state) {
            return null
        }

        return (
            <div className="ui grid no-margin">
                <UserForm
                    user={this.props.user}
                    onSubmit={this.onSubmit}
                />
                <div className="UserRow row">
                    <div className="one wide column collapsing">
                        <span className="ui checkbox">
                            <input type="checkbox"/>
                            <label></label>
                        </span>
                    </div>
                    <div className="two wide column">
                        {this.state.label}
                    </div>
                    <div className="eight wide column details">
                        <div className="ui header">
                            <span
                                className="subject">{this.state.name}</span>
                            <div className="body sub header">
                                {this.state.email}
                            </div>
                        </div>
                    </div>
                    <div className="five wide column">
                        <button className="ui button right">
                            Delete
                        </button>
                        <button className="ui button right" onClick={this.openEditUserForm}>
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
    key: PropTypes.string,
    onSubmit: PropTypes.func.isRequired
}
