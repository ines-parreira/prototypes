import React, { PropTypes } from 'react'
import classnames from 'classnames'
import Search from './../../../Search'


export default class ReplyMessageChannel extends React.Component {
    constructor(props) {
        super(props)

        // This should come from the API
        this.channels = {
            api: 'api',
            facebook: 'facebook',
            email: 'email'
        }

        this.defaultNames = {
            empty: 'select a receiver',
            private: 'your team'
        }
    }

    componentDidMount() {
        $('#next-message-channel-popup').dropdown({
            position: 'bottom left',
            hoverable: true,
            on: 'click'
        })
    }

    resolveReceiver() {
        /**
        * This gives us the name and the mail of the receiver depending on what is available in tickets.
        * This function is used in getReceiverData.
        */

        const { ticket } = this.props

        let res = {
            name: this.defaultNames.empty,
            email: ''
        }

        if (ticket.getIn(['newMessage', 'receiver', 'id']) || ticket.getIn(['newMessage', 'receiver', 'email'])) {
            res = {
                id: ticket.getIn(['newMessage', 'receiver', 'id']),
                name: ticket.getIn(['newMessage', 'receiver', 'name']),
                email: ticket.getIn(['newMessage', 'receiver', 'email'])
            }
        } else if (ticket.getIn(['requester', 'id'])) {
            res = {
                id: ticket.getIn(['requester', 'id']),
                name: ticket.getIn(['requester', 'name']),
                email: ticket.getIn(['requester', 'email'])
            }
        }

        return res
    }

    // This function gather and builds the data needed to render the receiver
    // (name, mail, className of the icon, and its channel)
    getReceiverData() {
        const identity = this.resolveReceiver()
        const message = this.props.ticket.get('newMessage')
        const channel = message.get('channel')
        const popupChannelClassNames = {
            default: 'action icon',
            private: 'action icon comment yellow',
            blueMail: 'action icon mail blue',
            facebook: 'action icon facebook square blue',
        }

        if (!identity.id && !identity.email) {
            return {
                name: this.defaultNames.empty,
                className: popupChannelClassNames.blueMail,
                public: true,
                channel
            }
        }

        if (!message.get('public')) {
            return {
                name: this.defaultNames.private,
                className: popupChannelClassNames.private,
                email: '',
                public: false,
                channel
            }
        }

        switch (channel) {
            case this.channels.email:
                return {
                    name: identity.name,
                    className: popupChannelClassNames.blueMail,
                    email: identity.email,
                    public: true,
                    channel
                }
            case this.channels.facebook:
                return {
                    name: identity.name,
                    className: popupChannelClassNames.facebook,
                    email: identity.email,
                    public: true,
                    channel
                }
            default:
                return {
                    name: identity.name,
                    className: popupChannelClassNames.default,
                    email: identity.email,
                    public: true,
                    channel
                }
        }
    }

    renderReceiver(obj) {
        const elem = $('#popup-receiver')

        if (obj.public) {
            elem.dropdown({
                allowAdditions: true,
                onChange: (value, text) => {
                    let receiver = this.props.ticket.getIn(['state', 'potentialRequesters']).find(req => req.get('id').toString() === value)

                    if (!receiver && value === 'new') {
                        receiver = { email: text }
                    }
                    this.props.actions.ticket.setReceiver(
                        receiver,
                        obj.channel
                    )
                }
            })

            elem.dropdown('bind intent')

            if (elem.dropdown('get text') === 'your team') {
                elem.dropdown('set text', obj.name)
            }
        } else {
            elem.dropdown('set text', obj.name)
            elem.dropdown('destroy')
        }
    }

    render() {
        const { ticket, actions } = this.props
        const receiverDisplayProp = 'email'
        const receiver = this.getReceiverData()
        this.renderReceiver(receiver)

        const addNewItem = ticket.getIn(['state', 'query']) && ticket.getIn(['state', 'query']).query.multi_match.query ? (
            <div
                key="add"
                className="item"
                data-value="new"
                data-text={ticket.getIn(['state', 'query']).query.multi_match.query}
            >
                Add <b>{ticket.getIn(['state', 'query']).query.multi_match.query}</b>
            </div>
        ) : null

        const receiverEmail = receiver.email ? (
            <div className="receiver-email" key="email">
                <i className="icon mail"/><span>{`<${receiver.email}>`}</span>
            </div>
        ) : null

        const receiverName = receiver.name ? (
            <div className="receiver-name" key="name"><b>{receiver.name}</b></div>
        ) : null

        return (
            <div className="ReplyMessageChannel">
                <span>

                    <div id="next-message-channel-popup" className="ui dropdown">
                        <i id="popup-message-channel" className={receiver.className}/>
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
                        {[receiverName, receiverEmail]}
                        <div className="menu">
                            <div className="ui search input">

                                <Search
                                    autofocus
                                    className="medium"
                                    onChange={this.props.actions.ticket.updatePotentialRequesters}
                                    query={{
                                        _source: ['id', 'name', 'email'],
                                        size: 5,
                                        query: {
                                            multi_match: {
                                                query: '',
                                                fuzziness: 3,
                                                fields: ['name', 'email']
                                            }
                                        }
                                    }}
                                    queryPath="query.multi_match.query"
                                    searchDebounceTime={300}
                                />

                            </div>
                            <div className="hidden item" key="placeholder" data-text="receiver"></div>
                            {
                                ticket.getIn(['state', 'potentialRequesters']).map(requester => {
                                    if (requester.get(receiverDisplayProp)) {
                                        return (
                                            <div
                                                key={requester.get('id')}
                                                data-value={requester.get('id')}
                                                data-text={requester.get(receiverDisplayProp)}
                                                className="item"
                                            >
                                                <i className="user icon"/>{requester.get(receiverDisplayProp)}
                                            </div>
                                        )
                                    }

                                    return null
                                })
                            }
                            {addNewItem}
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
