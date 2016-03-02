import React, {PropTypes} from 'react'
import {Modal} from 'react-semantify'

export default class UserForm extends React.Component {
    constructor(props) {
        super(props)

        if (this.props.user) {
            let role = 'user'

            if (this.props.user.roles.indexOf('admin') !== -1) {
                role = 'admin'
            } else if (this.props.user.roles.indexOf('agent') !== -1) {
                role = 'agent'
            }

            this.state = {
                id: 'userform-' + this.props.user.id,
                title: 'Modify a user',
                name: this.props.user.name,
                email: this.props.user.email,
                role: role
            }
        } else {
            this.state = {
                id: 'userform-new',
                title: 'Add a user',
                name: '',
                email: '',
                role: 'user'
            }
        }

        this.nameChange = this.nameChange.bind(this)
        this.emailChange = this.emailChange.bind(this)
        this.roleChange = this.roleChange.bind(this)
        this.submit = this.submit.bind(this)
    }

    componentDidMount() {
        $('#userform-new').modal({detachable: false})
        $(document).on('change', '#name-' + this.state.id, this.nameChange)
        $(document).on('change', '#email-' + this.state.id, this.emailChange)
        $(document).on('change', '#role-' + this.state.id, this.roleChange)
        $(document).on('click', '#submit-' + this.state.id, this.submit)
    }

    submit = () => {
        this.props.onSubmit({
            name: this.state.name,
            email: this.state.email,
            password: '',
            roles: [this.state.role]
        })
    }

    nameChange = (event) => {
        this.setState({name: event.target.value})
    }

    emailChange(event) {
        this.setState({email: event.target.value})
    }

    roleChange(event) {
        this.setState({role: event.target.value})
    }

    render() {
        return (
            <Modal id={this.state.id} className="UserForm small" init>
                <div className="header">{this.state.title}</div>
                <div className="content">
                    <form className="ui form">
                        <div className="field">
                            <label>Name</label>
                            <input id={'name-' + this.state.id} type="text"/>
                        </div>
                        <div className="field">
                            <label>Email address</label>
                            <input id={'email-' + this.state.id} type="text"/>
                        </div>
                        <div className="field">
                            <label>Role</label>
                            <select id={'role-' + this.state.id} className="ui fluid dropdown">
                                <option value="user">User</option>
                                <option value="agent">Agent</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button id={'submit-' + this.state.id} className="ui button" type="button">Submit</button>
                    </form>
                </div>
            </Modal>
        )
    }
}

UserForm.propTypes = {
    user: PropTypes.object,
    onSubmit: PropTypes.func.isRequired
}
