import React, { PropTypes } from 'react'
import instantsearch from 'instantsearch.js'


export default class ReplyMessageChannel extends React.Component {
    componentDidMount() {
        if (this.props.settings.get('loaded')) {
            this.loadSearch(this.props)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.settings.get('loaded') && !nextProps.settings.get('searchLoaded').get('requester')) {
            this.loadSearch(nextProps)
        }
    }

    loadSearch(props) {
        function searchResults({ updateMethod }) {
            return {
                render({ results }) {
                    updateMethod(results.hits)
                }
            }
        }

        const search = instantsearch({
            appId: props.settings.get('data').get('algolia_app_name'),
            apiKey: props.settings.get('data').get('algolia_api_key'),
            indexName: props.settings.get('data').get('indices_names').get('user')
        })

        search.addWidget(
            instantsearch.widgets.searchBox({
                container: document.querySelector('#search-requester')
            })
        )

        search.addWidget(
            searchResults({
                updateMethod: props.actions.ticket.updatePotentialRequesters
            })
        )

        props.actions.settings.loadedSearch('requester')
        search.start()
    }

    update() {

    }

    render() {
        const { ticket, actions } = this.props
        const channel = this.props.ticket.get('channel')
        let className = 'action icon '
        let receiver = 'select a receiver'

        if (!this.props.ticket.getIn(['newMessage', 'public'])) {
            className += 'comment yellow'
            receiver = 'your team'
        } else if (channel === 'email') {
            className += 'mail blue'
            receiver = ticket.getIn(['requester', 'email']) || receiver
        } else if (channel === 'facebook') {
            className += 'facebook blue'
            receiver = ticket.getIn(['requester', 'name']) || receiver
        } else {
            receiver = 'No one'
        }

        $('#popup-message-channel').popup({
            popup: '#next-message-channel-popup',
            position: 'bottom left',
            hoverable: true,
            on: 'click'
        })

        $('#popup-receiver').dropdown({
            allowAdditions: true,
            onChange: (value, text) => {
                const chosenReceiver = this.props.ticket
                    .getIn(['state', 'potentialRequesters'])
                    .filter(requester => requester.email === text)[0]
                this.props.actions.ticket.setReceiver(chosenReceiver.id)
            }
        })

        return (
            <div className="ReplyMessageChannel">
                <span>
                    <i id="popup-message-channel" className={className}/>
                    <span className="label">To: </span>
                    <div id="popup-receiver" className="ui inline dropdown">
                        <div className="text"><b>{receiver}</b></div>
                        <div className="menu">
                            <div className="ui search icon input">
                              <i className="search icon"/>
                              <input id="search-requester" type="text" name="search" placeholder="Search issues..."/>
                            </div>
                            {
                                ticket.getIn(['state', 'potentialRequesters']).map(requester => (
                                    <div className="item">{requester.email}</div>
                                ))
                            }
                        </div>
                    </div>

                </span>

                <div id="next-message-channel-popup" className="ui popup">
                    <div
                        className="ui vertical menu"
                        style={{ textAlign: 'left', border: 'none', width: 'inherit' }}
                    >
                        <div className="item" onClick={() => actions.ticket.setPublic(true)}>
                            Send as email
                        </div>
                        <div className="item" onClick={() => actions.ticket.setPublic(false)}>
                            Send as internal note
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

ReplyMessageChannel.propTypes = {
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
}
