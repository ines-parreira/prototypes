import React, {PropTypes} from 'react'

export default class UserForm extends React.Component {
    constructor(props) {
        super(props)

        this.initialState = {
            id: 'userform-new',
            title: 'Add a user',
            name: '',
            email: '',
            role: 'user'
        }

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
            this.state = Object.assign({}, this.initialState)
        }

        this.nameChange = this.nameChange.bind(this)
        this.emailChange = this.emailChange.bind(this)
        this.roleChange = this.roleChange.bind(this)
        this.submit = this.submit.bind(this)
    }

    componentDidMount() {
        $('#' + this.state.id).modal()
        $(document).on('change', '#name-' + this.state.id, this.nameChange)
        $(document).on('change', '#email-' + this.state.id, this.emailChange)
        $(document).on('change', '#role-' + this.state.id, this.roleChange)
        $(document).on('click', '#submit-' + this.state.id, this.submit)
    }

    submit = () => {
        let data = {}
        let id

        if (!this.props.user) {
            data = {
                name: this.state.name,
                email: this.state.email,
                password: '',
                roles: [this.state.role]
            }
        } else {
            if (this.state.name !== this.props.user.name) {
                data.name = this.state.name
            }
            if (this.state.email !== this.props.user.email) {
                data.email = this.state.email
            }
            if (this.props.user.roles.indexOf(this.state.role) === -1) {
                data.roles = [this.state.role]
            }
            id = this.props.user.id
        }

        this.props.onSubmit(data, id)
        $('#' + this.state.id).modal('hide')
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
            <div id={this.state.id} className="UserForm ui modal small">
                <div className="header">{this.state.title}</div>
                <div className="content">
                    <form className="ui form">
                        <div className="field">
                            <label>Name</label>
                            <input id={'name-' + this.state.id} type="text" defaultValue={this.state.name}/>
                        </div>
                        <div className="field">
                            <label>Email address</label>
                            <input id={'email-' + this.state.id} type="text" defaultValue={this.state.email}/>
                        </div>
                        <div className="field">
                            <label>Role</label>
                            <select id={'role-' + this.state.id} defaultValue={this.state.role} className="ui fluid dropdown">
                                <option value="user">User</option>
                                <option value="agent">Agent</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button id={'submit-' + this.state.id} className="ui button" type="button">Submit</button>
                    </form>
                </div>
            </div>
        )
    }
}

UserForm.propTypes = {
    user: PropTypes.object,
    onSubmit: PropTypes.func.isRequired
}
