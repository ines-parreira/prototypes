import React, { PropTypes } from 'react'
import UserList from './UserList'
import Search from '../Search'
import UserForm from './UserForm'
import ShowMoreFieldsDropdown from '../ShowMoreFieldsDropdown'


export default class UsersView extends React.Component {
    render() {
        const { items } = this.props
        const { createUser } = this.context

        if (!items) {
            return null
        }
        return (
            <div className="UsersView">
                <div className="ui text menu">

                    <div className="left menu item">
                        <ShowMoreFieldsDropdown />
                    </div>
                    <div className="right menu item">
                        <div className="item">
                            <Search id="user"/>
                        </div>
                    </div>
                </div>

                <div className="ui grid view-header">
                    <div className="thirteen wide column">
                        <h1 className="ui header">Users</h1>
                    </div>
                    <div className="three wide column">
                        <UserForm
                            onSubmit={createUser}
                        />
                        <button className="ui right floated green button" onClick={() => {$('#userform-new').modal('show')}}>
                            ADD USER
                        </button>
                    </div>
                </div>
                <UserList
                    items={items}
                />
            </div>
        )
    }
}

UsersView.propTypes = {
    items: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired
}

UsersView.contextTypes = {
    createUser: PropTypes.func.isRequired
}
