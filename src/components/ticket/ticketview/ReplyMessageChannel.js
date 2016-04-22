import React, { PropTypes } from 'react'
import classnames from 'classnames'
import { loadSearch } from './../../../utils'


export default class ReplyMessageChannel extends React.Component {
    componentDidMount() {
        if (this.props.settings.get('loaded')) {
            loadSearch(this.props, 'user', 'requester', this.props.actions.ticket.updatePotentialRequesters)
        }

        $('#next-message-channel-popup').dropdown({
            position: 'bottom left',
            hoverable: true,
            on: 'click'
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.settings.get('loaded') && !nextProps.settings.get('searchLoaded').get('requester')) {
            loadSearch(nextProps, 'user', 'requester', nextProps.actions.ticket.updatePotentialRequesters)
        }
    }

    updateSearchInput(e) {
        this.refs.searchRequester.value = e.target.value
        this.refs.searchRequester.dispatchEvent(new Event('input'))
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
                onChange: (text, value) => {
                    this.props.actions.ticket.setReceiver(text, value, channel)
                }
            })


            if (channel === 'email' || channel === 'api') {
                className += 'mail blue'
            } else if (channel === 'facebook') {
                className += 'facebook square blue'
                receiverDisplayProp = 'name'
            }

            receiver = ticket.getIn(['newMessage', 'receiver', receiverDisplayProp])
                || ticket.getIn(['requester', receiverDisplayProp])
                || receiver

            popupReceiver.dropdown('bind intent')

            if (popupReceiver.dropdown('get text') === 'your team') {
                popupReceiver.dropdown('set text', receiver)
            }
        }

        return (
            <div className="ReplyMessageChannel">
                {/* This hidden input mirrors the search input of the dropdown, and is the one which Algolia listens to. */}
                <input
                    id="search-requester"
                    ref="searchRequester"
                    style={{ display: 'none'}}
                />

                <span>

                    <div id="next-message-channel-popup" className="ui dropdown">
                        <i id="popup-message-channel" className={className}/>
                        <div
                            className="ui vertical menu"
                            style={{ textAlign: 'left', border: 'none', width: 'inherit' }}
                        >
                            <div className="item" onClick={() => actions.ticket.setPublic(true)}>
                                Send as email
                            </div>
                            <div
                                className={classnames(
                                    'item',
                                    ticket.get('id') ? '' : 'disabled'
                                 )}
                                onClick={() => actions.ticket.setPublic(false)}
                            >
                                Send as internal note
                            </div>
                        </div>
                    </div>

                    <span className="label">To: </span>

                    <div id="popup-receiver" className="ui inline dropdown">
                        <div><b>{receiver}</b></div>
                        <div className="menu">
                            <div className="ui search input">
                                <input
                                    type="text"
                                    name="search"
                                    data-text={ticket.getIn(['state', 'query'])}
                                    value={ticket.getIn(['state', 'query'])}
                                    placeholder="Search customers..."
                                    onChange={this.updateSearchInput.bind(this)}
                                />
                            </div>
                            <div className="hidden item" data-text="receiver"></div>
                            {
                                ticket.getIn(['state', 'potentialRequesters']).map(requester => {
                                    if (requester[receiverDisplayProp]) {
                                        return (
                                            <div
                                                key={requester.id}
                                                data-value={requester.id}
                                                data-text={requester[receiverDisplayProp]}
                                                className="item"
                                            >
                                                <i className="user icon"/>{requester[receiverDisplayProp]}
                                            </div>
                                        )
                                    }
                                })
                            }
                        </div>
                    </div>

                </span>

            </div>
        )
    }
}

ReplyMessageChannel.propTypes = {
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
}
