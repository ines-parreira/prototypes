import React, {PropTypes} from 'react'

export default class InfobarSearchResultsList extends React.Component {
    _onClick = (user) => this.props.fetchPreviewUser(user.get('id'))

    render() {
        const {searchResults} = this.props

        if (!searchResults.size) {
            return <p className="empty-items">No user found.</p>
        }

        return (
            <div className="InfobarSearchResultsList">
                <h2>Users</h2>
                <div className="ui container">
                    {
                        searchResults.map((user, idx) => {
                            return (
                                <div
                                    className="ui segment InfobarSearchResultsDetail"
                                    key={idx}
                                    onClick={() => this._onClick(user)}
                                >
                                    {
                                        user.get('name') && (
                                            <h3>{user.get('name')}</h3>
                                        )
                                    }
                                    {
                                        user.get('email') && (
                                            <p>{user.get('email')}</p>
                                        )
                                    }
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
    fetchPreviewUser: PropTypes.func.isRequired
}
