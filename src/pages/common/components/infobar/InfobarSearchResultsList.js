import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Card, CardBlock, Badge} from 'reactstrap'

export default class InfobarSearchResultsList extends React.Component {
    render() {
        const {searchResults, defaultUserId} = this.props

        if (!searchResults.size) {
            return <p className="empty-items">No user found.</p>
        }

        return (
            <div className="InfobarSearchResultsList">
                <h2>Users</h2>
                <div className="mt-3">
                    {
                        searchResults.map((user, idx) => {
                            const isDefaultUser = user.get('id') === defaultUserId
                            const className = classnames('InfobarSearchResultsDetail mb-2', {
                                'current-user': isDefaultUser
                            })

                            return (
                                <Card
                                    className={className}
                                    key={idx}
                                    onClick={() => this.props.onUserClick(user)}
                                >
                                    <CardBlock>
                                        {
                                            user.get('name') && (
                                                <h5>
                                                    {user.get('name')}
                                                    {
                                                        isDefaultUser && (
                                                            <Badge
                                                                color="info"
                                                                className="ml-2"
                                                            >
                                                                Current User
                                                            </Badge>
                                                        )
                                                    }
                                                </h5>
                                            )
                                        }
                                        {
                                            user.get('email') && (
                                                <p>{user.get('email')}</p>
                                            )
                                        }
                                    </CardBlock>
                                </Card>
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
    onUserClick: PropTypes.func.isRequired
}
