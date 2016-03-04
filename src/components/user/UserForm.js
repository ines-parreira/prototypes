import React, {PropTypes} from 'react'

export default class UserForm extends React.Component {
    constructor(props) {
        super(props)

        this.submit = this.submit.bind(this)
        this.close = this.close.bind(this)
    }

    componentDidMount() {
        const id = 'userform-' + (this.props.user ? this.props.user.id : 'new')
        $('#userform-' + (this.props.user ? this.props.user.id : 'new')).modal()
        $(document).on('submit', '#form-' + id, this.submit)
        $(document).on('click', '#close-' + id, this.close)
    }

    submit(e) {
        e.preventDefault()
        const data = {
            name: $('#name-userform-' + (this.props.user ? this.props.user.id : 'new')).val(),
            email: $('#email-userform-' + (this.props.user ? this.props.user.id : 'new')).val(),
            role: $('#role-userform-' + (this.props.user ? this.props.user.id : 'new')).val()
        }

        if (this.props.user) {
            const sendData = {}


            if (this.props.user.name !== data.name) {
                sendData.name = data.name
            }

            if (this.props.user.email !== data.email) {
                sendData.email = data.email
            }

            this.props.onSubmit(sendData, this.props.user.id)
        } else {
            this.props.onSubmit(data)
        }

        $('#userform-' + (this.props.user ? this.props.user.id : 'new')).modal('hide')
    }

    close() {
        $('#userform-' + (this.props.user ? this.props.user.id : 'new')).modal('hide')
    }

    render() {
        const { user } = this.props

        const id = 'userform-' + (user ? user.id : 'new')
        const title = user ? 'Modify a user' : 'Add a user'

        const defaultName = user ? user.name : ''
        const defaultEmail = user ? user.email : ''
        const defaultRole = user ? user.roles[0] : 'user'

        return (
            <div id={id} className="UserForm ui modal small">
                <i id={'close-' + id} className="large remove action icon modal-close"></i>
                <div className="header">{title}</div>
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