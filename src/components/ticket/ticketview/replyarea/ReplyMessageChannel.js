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
            email: 'email',
            private: 'private'
        }

        this.defaultNames = {
            empty: 'select a receiver',
            private: 'your team'
        }
    }

    componentDidMount() {
        // Fix this
        // this.props.actions.ticket.updatePotentialRequesters()

        $('#next-message-channel-popup').dropdown({
            position: 'bottom left',
            hoverable: true,
            on: 'click'
        })
    }

    // This function gather and builds the data needed to render the receiver
    // (name, mail, className of the icon, and its channel)
    getReceiverData() {
        const identity = this.resolveReceiver()
        const channel = this.props.ticket.get('channel')
        const popupChannelClassNames = {
            default: 'action icon',
            private: 'action icon comment yellow',
            blueMail: 'action icon mail blue',
            facebook: 'action icon facebook square blue',
        }

        switch (channel) {
            case this.channels.private:
                return {
                    name: this.defaultNames.private,
                    className: popupChannelClassNames.private,
                    email: '',
                    channel
                }
            case this.channels.api:
                return {
                    name: identity.name,
                    className: popupChannelClassNames.blueMail,
                    email: identity.email,
                    channel
                }
            case this.channels.email:
                return {
                    name: identity.name,
                    className: popupChannelClassNames.blueMail,
                    email: identity.email,
                    channel
                }
            case this.channels.facebook:
                return {
                    name: identity.name,
                    className: popupChannelClassNames.facebook,
                    email: identity.email,
                    channel
                }
            default:
                return {
                    name: identity.name,
                    className: popupChannelClassNames.default,
                    email: identity.email,
                    channel
                }
        }
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

        if (ticket.getIn(['newMessage', 'receiver', 'id'])) {
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

    renderReceiver(obj, elem) {
        if (obj.channel !== this.channels.private) {
            elem.dropdown({
                allowAdditions: true,
                onChange: (value) => {
                    this.props.actions.ticket.setReceiver(
                        this.props.ticket.getIn(['state', 'potentialRequesters']).find(req => req.get('id').toString() === value),
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

        return obj
    }

    render() {
        const { ticket, actions } = this.props
        const receiverDisplayProp = 'email'
        const popupReceiver = $('#popup-receiver')
        const receiver = this.renderReceiver(this.getReceiverData(this.channels.private), popupReceiver)

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

                    <div id="popup-receiver" className="ui inline dropdown" onClick={ () => this.refs.searchInput.focus() }>
                        { [receiverName, receiverEmail]}
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
                            <div className="hidden item" data-text="receiver"></div>
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
