import React, {PropTypes} from 'react'
import UserList from './UserList'
import Search from '../Search'
import UserForm from './UserForm'


export default class UsersView extends React.Component {
    openNewUserForm = () => {
        $('#userform-new').modal('show')
    }

    render() {
        const { items, form } = this.props
        const { createUser } = this.context

        if (!items) {
            return null
        }
        return (
            <div className="UsersView">
                <div className="ui text menu">
                    <Search/>
                </div>

                <div className="ui grid">
                    <div className="thirteen wide column">
                        <h1 className="ui header">Users</h1>
                    </div>
                    <div className="three wide column">
                        <UserForm
                            onSubmit={createUser}
                            form={form}
                        />
                        <button className="ui button" onClick={this.openNewUserForm}>
                            Add a user
                        </button>
                    </div>
                </div>
                <UserList
                    items={items}
                    form={form}
                />
            </div>
        )
    }
}

UsersView.propTypes = {
    items: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired
}

UsersView.contextTypes = {
    createUser: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired
}


