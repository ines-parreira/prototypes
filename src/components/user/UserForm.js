import React, {PropTypes} from 'react'
import { reduxForm } from 'redux-form'

class UserForm extends React.Component {
    render() {
        return (
            <div id="newuserform" className="UserForm ui small modal">
                <div className="header">Add a user</div>
                <div className="content">
                    <div className="ui form">
                        <div className="field">
                            <label>Name</label>
                            <input type="text" name="name" placeholder="Tony Stark"/>
                        </div>
                        <div className="field">
                            <label>Email address</label>
                            <input type="text" name="email" placeholder="tony@stark.com"/>
                        </div>
                        <div className="field">
                            <label>Role</label>
                            <select name="role" className="ui fluid dropdown">
                                <option value="user">User</option>
                                <option value="agent">Agent</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button className="ui button" type="submit" onSubmit={this.props.onSubmit}>Submit</button>
                    </div>
                </div>
            </div>
        )
    }
}

UserForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    user: PropTypes.object
}

UserForm = reduxForm({
    form: 'userForm',
    fields: ['name', 'email', 'role']
})(UserForm)

export default UserForm
