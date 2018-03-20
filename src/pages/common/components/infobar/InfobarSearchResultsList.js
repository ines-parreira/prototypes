import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Card, CardBody, CardTitle, Badge} from 'reactstrap'

import {getDisplayName} from '../../../../state/users/helpers'

import css from './Infobar.less'

export default class InfobarSearchResultsList extends React.Component {
    render() {
        const {searchResults, defaultUserId} = this.props

        if (!searchResults.size) {
            return <p className="empty-items">No user found.</p>
        }

        return (
            <div>
                <CardTitle className={css.cardTitle}>
                    Users found:
                </CardTitle>
                <div className="mt-3">
                    {
                        searchResults.map((user, idx) => {
                            const isDefaultUser = user.get('id') === defaultUserId
                            const className = classnames('clickable mb-2', {
                                'current-user': isDefaultUser
                            })

                            return (
                                <Card
                                    className={className}
                                    key={idx}
                                    onClick={() => this.props.onUserClick(user)}
                                >
                                    <CardBody>
                                        {
                                            <span className={classnames(css.subtitle, 'd-block mb-1 text-truncate')}>
                                                {getDisplayName(user)}
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
                                            </span>
                                        }
                                        {
                                            user.get('email') && (
                                                <div className={classnames(css.detail, 'd-block text-truncate')}>
                                                    {user.get('email')}
                                                </div>
                                            )
                                        }
                                    </CardBody>
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
