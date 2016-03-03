import React, {PropTypes} from 'react'

export default class UserForm extends React.Component {
    constructor(props) {
        super(props)

        this.formChange = this.formChange.bind(this)
        this.submit = this.submit.bind(this)
        this.close = this.close.bind(this)
    }

    componentDidMount() {
        const id = 'userform-' + (this.props.user ? this.props.user.id : 'new')
        $('#userform-' + (this.props.user ? this.props.user.id : 'new')).modal()
        $(document).on('change', '#name-' + id, this.formChange)
        $(document).on('change', '#email-' + id, this.formChange)
        $(document).on('change', '#role-' + id, this.formChange)
        $(document).on('click', '#submit-' + id, this.submit)
    }

    submit() {
        if (this.props.user) {
            const sendData = {}

            for (const k in this.props.form) {
                if (this.props.user[k] !== this.props.form[k] && this.props.form[k] !== ''
                && (k !== 'role' || this.props.user.roles.indexOf(this.props.form.role) === -1)) {
                    sendData[k] = this.props.form[k]
                }
            }

            this.props.onSubmit(sendData, this.props.user.id)
        } else {
            this.props.onSubmit(this.props.form)
        }

        $('#userform-' + (this.props.user ? this.props.user.id : 'new')).modal('hide')
    }

    formChange = (event) => {
        const data = {}
        data[event.target.name] = event.target.value
        this.context.updateForm(data)
    }

    close() {
        $('#userform-' + (this.props.user ? this.props.user.id : 'new')).modal('hide')
    }

    render() {
        const { form } = this.props

        const id = 'userform-' + (this.props.user ? this.props.user.id : 'new')
        const title = this.props.user ? 'Modify a user' : 'Add a user'

        return (
            <div id={id} className="UserForm ui modal small">
                <i id={'close-' + id} className="remove icon"></i>
                <div className="header">{title}</div>
                <div className="content">
                    <form className="ui form">
                        <div className="field">
                            <label>Name</label>
                            <input id={'name-' + id} name="name" type="text" defaultValue={form.name}/>
                        </div>
                        <div className="field">
                            <label>Email address</label>
                            <input id={'email-' + id} name="email" type="text" defaultValue={form.email}/>
                        </div>
                        <div className="field">
                            <label>Role</label>
                            <select id={'role-' + id} name="role" defaultValue={form.role} className="ui fluid dropdown">
                                <option value="user">User</option>
                                <option value="agent">Agent</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button id={'submit-' + id} className="ui button" type="button">Submit</button>
                    </form>
                </div>
            </div>
        )
    }
}

UserForm.propTypes = {
    user: PropTypes.object,
    form: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired
}

UserForm.contextTypes = {
    updateForm: PropTypes.func.isRequired
}
