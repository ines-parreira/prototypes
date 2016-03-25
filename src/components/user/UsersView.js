import React, { PropTypes } from 'react'
import UserList from './UserList'
import Search from '../Search'
import UserForm from './UserForm'


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
                        <div className="ShowMoreFieldsDropdown">
                            <div className="ui button teal basic custom">
                                <i className="columns icon"/>
                                Show more fields
                            </div>
                            <div className="ui popup custom">
                                <div className="ui form">
                                    <div className="grouped fields">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="right menu item">
                        <div className="item">
                            <Search id="user"/>
                        </div>
                    </div>
                </div>

                <div className="ui grid">
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
