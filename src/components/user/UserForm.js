import React, {PropTypes} from 'react'
import { reduxForm } from 'redux-form'

export default class UserForm extends React.Component {
    render() {
        let id = 'userform-new'
        let nameInput = <input type="text" name="name" placeholder="Tony Stark" />
        let emailInput = <input type="text" name="email" placeholder="tony@stark.com" />

        let defaultRole = 'user'

        let title = "Add a user"

        if (this.props.user) {
            title = "Modify a user"
            nameInput = <input type="text" name="name" placeholder="Tony Stark" value={this.props.user.name}/>
            emailInput = <input type="text" name="email" placeholder="tony@stark.com" value={this.props.user.email}/>
            id = 'userform-' + this.props.user.id


            if (this.props.user.roles.indexOf('admin') !== -1) {
                defaultRole = 'admin'
            } else if (this.props.user.roles.indexOf('agent') !== -1) {
                defaultRole = 'agent'
            }
        }


        return (
            <div id={id} className="UserForm ui small modal">
                <div className="header">{title}</div>
                <div className="content">
                    <div className="ui form">
                        <div className="field">
                            <label>Name</label>
                            {nameInput}
                        </div>
                        <div className="field">
                            <label>Email address</label>
                            {emailInput}
                        </div>
                        <div className="field">
                            <label>Role</label>
                            <select name="role" className="ui fluid dropdown" defaultValue={defaultRole}>
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
    onSubmit: PropTypes.func,
    user: PropTypes.object
}
