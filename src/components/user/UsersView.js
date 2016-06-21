import React, {PropTypes} from 'react'
import UserList from './UserList'
import Search from '../Search'
import UserForm from './UserForm'


export default class UsersView extends React.Component {
    render() {
        const {items, isLoading} = this.props
        const {createUser} = this.context

        return (
            <div className="UsersView">
                <div className="ui text menu">
                    <div className="right menu item">
                        <div className="item">
                            <Search
                                autofocus
                                onChange={this.props.search}
                                className="long"
                                queryPath="query.multi_match.query"
                                query={{
                                    _source: ['id', 'name', 'email', 'roles'],
                                    query: {
                                        multi_match: {
                                            query: '',
                                            fuzziness: 3,
                                            fields: ['name', 'email']
                                        }
                                    }
                                }}
                                placeholder="Search users"
                                searchDebounceTime={400}
                            />
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
                        <button className="ui right floated green button"
                                onClick={() => { $('#userform-new').modal('show') }}
                        >
                            ADD USER
                        </button>
                    </div>
                </div>
                <UserList
                    items={items}
                    isLoading={isLoading}
                />
            </div>
        )
    }
}

UsersView.propTypes = {
    items: PropTypes.object.isRequired,
    search: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired
}

UsersView.contextTypes = {
    createUser: PropTypes.func.isRequired
}
