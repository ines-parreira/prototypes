import React, {PropTypes} from 'react'

import UserRow from './UserRow'

export default class UserList extends React.Component {
    constructor(props) {
        super(props)

        this.sortById = this.sortById.bind(this)
        this.sortByName = this.sortByName.bind(this)
    }

    componentDidMount() {
        $(document).on('click', '#users-name-sort', this.sortByName)
    }

    sortById = () => {
        this.setState({items: this.props.items.sort(function(i1, i2) {
            let res = 0

            if (i1.id < i2.id) {
                res = -1
            } else if (i1.id > i2.id) {
                res = 1
            }

            return res
        })})
    }

    sortByName = () => {
        this.setState({items: this.props.items.sort(function(i1, i2) {
            let res = 0

            if (i1.name < i2.name) {
                res = -1
            } else if (i1.name > i2.name) {
                res = 1
            }

            return res
        })})
    }

    render() {
        const { updateUser, deleteUser } = this.props

        return (
            <div className="UserList">
                <div className="ui grid">
                    <div className="row head-row">
                        <div className="one wide column">
                            <span className="ui checkbox">
                                <input type="checkbox"/>
                                <label></label>
                            </span>
                        </div>
                        <div className="two wide column">Role <i id="users-role-sort" className="sort icon"></i></div>
                        <div className="eight wide column">User <i id="users-name-sort" className="sort icon"></i></div>
                    </div>
                </div>
                <div className="ui divided items">
                    {this.props.items.map((user) => {
                        return (
                            <UserRow
                                key={user.id}
                                user={user}
                                updateUser={updateUser}
                                deleteUser={deleteUser}
                            />
                        )
                    })}
                </div>
            </div>
        )
    }
}

UserList.propTypes = {
    items: PropTypes.array.isRequired,
    updateUser: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired
}
