import React, { PropTypes } from 'react'
import instantsearch from 'instantsearch.js'


export default class ReplyMessageChannel extends React.Component {
    componentDidMount() {
        if (this.props.settings.get('loaded')) {
            this.loadSearch(this.props)
        }

        $('#popup-message-channel').popup({
            popup: '#next-message-channel-popup',
            position: 'bottom left',
            hoverable: true,
            on: 'click'
        })
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
                    updateMethod(results.hits.splice(null, 5))
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
                updateMethod: props.actions.ticket.updatePotentialRequesters,
                hitsPerPage: 5
            })
        )

        props.actions.settings.loadedSearch('requester')
        search.start()
    }

    render() {
        const { ticket, actions } = this.props
        const channel = this.props.ticket.get('channel')
        let className = 'action icon '
        let receiver = 'select a receiver'
        let receiverDisplayProp = 'email'
        const popupReceiver = $('#popup-receiver')

        if (!this.props.ticket.getIn(['newMessage', 'public'])) {
            className += 'comment yellow'
            receiver = 'your team'

            popupReceiver.dropdown('set text', receiver)
            popupReceiver.dropdown('destroy')
        } else {
            popupReceiver.dropdown({
                allowAdditions: true,

                onChange: (value, text) => {
                    const chosenReceiver = this.props.ticket
                        .getIn(['state', 'potentialRequesters'])
                        .filter(requester => requester.email === text)[0]
                    this.props.actions.ticket.setReceiver(chosenReceiver.id)
                }
            })

            if (channel === 'email' || channel === 'api') {
                className += 'mail blue'
                receiver = ticket.getIn(['requester', 'email']) || receiver
            } else if (channel === 'facebook') {
                className += 'facebook square blue'
                receiver = ticket.getIn(['requester', 'name']) || receiver
                receiverDisplayProp = 'name'
            } else {
                receiver = 'No one'
            }

            popupReceiver.dropdown('bind intent')

            if (popupReceiver.dropdown('get text') === 'your team') {
                popupReceiver.dropdown('set text', receiver)
            }
        }

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
                              <input id="search-requester" type="text" name="search" placeholder="Search customers..."/>
                            </div>
                            {
                                ticket.getIn(['state', 'potentialRequesters']).map(requester => (
                                    <div key={requester.id} className="item">{requester[receiverDisplayProp]}</div>
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
