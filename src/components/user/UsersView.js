import React, {PropTypes} from 'react'
import UserList from './UserList'
import Search from '../Search'
import UserForm from './UserForm'


export default class UsersView extends React.Component {
    openNewUserForm = () => {
        $('#userform-new').modal('show')
    }

    render() {
        const { items, onSubmit } = this.props
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
                            onSubmit={onSubmit}
                        />
                        <button className="ui button" onClick={this.openNewUserForm}>
                            Add a user
                        </button>
                    </div>
                </div>
                <UserList
                    items={items}
                    onSubmit={onSubmit}
                />
            </div>
        )
    }
}

UsersView.propTypes = {
    currentUser: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    items: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired
}
