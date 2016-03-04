import React, {PropTypes} from 'react'

export default class UserForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {id: 'userform-' + (this.props.user ? this.props.user.id : 'new')}
        this.submit = this.submit.bind(this)
        this.close = this.close.bind(this)
    }

    componentDidMount() {
        $('#' + this.state.id).modal()
        $(document).on('submit', '#form-' + this.state.id, this.submit)
        $(document).on('click', '#close-' + this.state.id, this.close)
    }

    submit(e) {
        e.preventDefault()

        const data = {
            name: $('#name-' + this.state.id).val(),
            email: $('#email-' + this.state.id).val(),
            role: $('#role-' + this.state.id).val()
        }

        if (this.props.user) {
            const sendData = {}


            if (this.props.user.name !== data.name) {
                sendData.name = data.name
            }

            if (this.props.user.email !== data.email) {
                sendData.email = data.email
            }

            if (this.props.user.roles.indexOf(data.role) === -1) {
                sendData.roles = [data.role]
            }

            this.props.onSubmit(sendData, this.props.user.id)
        } else {
            this.props.onSubmit(data)
        }

        $('#' + this.state.id).modal('hide')
    }

    close() {
        $('#' + this.state.id).modal('hide')
    }

    render() {
        const { user } = this.props

        const id = this.state.id
        const title = user ? 'Modify a user' : 'Add a user'

        const defaultName = user ? user.name : ''
        const defaultEmail = user ? user.email : ''
        const defaultRole = user ? user.roles[0] : 'user'

        return (
            <div id={id} className="UserForm ui modal small">
                <div className="header">
                    {title}
                    <i id={'close-' + id} className="remove action icon modal-close"></i>
                </div>
                <div className="content">
                    <form id={'form-' + id} className="ui form">
                        <div className="field">
                            <label>Name</label>
                            <input id={'name-' + id} name="name" type="text" defaultValue={defaultName}/>
                        </div>
                        <div className="field">
                            <label>Email address</label>
                            <input id={'email-' + id} name="email" type="email" defaultValue={defaultEmail} required/>
                        </div>
                        <div className="field">
                            <label>Role</label>
                            <select id={'role-' + id} name="role" defaultValue={defaultRole} className="ui fluid dropdown">
                                <option value="user">User</option>
                                <option value="agent">Agent</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button id={'submit-' + id} className="ui button" type="submit">Submit</button>
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
