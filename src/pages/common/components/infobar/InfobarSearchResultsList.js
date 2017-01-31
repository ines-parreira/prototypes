import React, {PropTypes} from 'react'
import classnames from 'classnames'

export default class InfobarSearchResultsList extends React.Component {
    _onClick = (user) => {
        this.props.fetchPreviewUser(user.get('id'))
    }

    render() {
        const {searchResults, defaultUserId} = this.props

        if (!searchResults.size) {
            return <p className="empty-items">No user found.</p>
        }

        return (
            <div className="InfobarSearchResultsList">
                <h2>Users</h2>
                <div className="ui container">
                    {
                        searchResults.map((user, idx) => {
                            const isDefaultUser = user.get('id') === defaultUserId
                            const className = classnames('ui segment InfobarSearchResultsDetail', {
                                'current-user': isDefaultUser
                            })

                            return (
                                <div
                                    className={className}
                                    key={idx}
                                    onClick={() => this._onClick(user)}
                                >
                                    <div>
                                        {
                                            user.get('name') && (
                                                <h3>
                                                    {user.get('name')}
                                                    {
                                                        isDefaultUser && (
                                                            <span
                                                                className="ui light blue horizontal label right middle"
                                                            >
                                                                Current User
                                                            </span>
                                                        )
                                                    }
                                                </h3>
                                            )
                                        }
                                        {
                                            user.get('email') && (
                                                <p>{user.get('email')}</p>
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

InfobarSearchResultsList.propTypes = {
    searchResults: PropTypes.object.isRequired,
    defaultUserId: PropTypes.number,
    fetchPreviewUser: PropTypes.func.isRequired
}
