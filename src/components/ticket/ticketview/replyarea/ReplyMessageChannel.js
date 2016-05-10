import React, { PropTypes } from 'react'
import classnames from 'classnames'


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

    // This gives us the name and the mail of the receiver depending on what is available in tickets
    // This function is used in getReceiverData
    resolveReceiver() {
        const { ticket } = this.props

        const data = {
            receiver: ticket.getIn(['newMessage', 'receiver', 'id']) ? 'receiver' : null,
            requester: ticket.getIn(['requester', 'id']) ? 'requester' : null
        }

        const role = data.receiver || data.requester

        switch (role) {
            case 'receiver':
                return {
                    name: ticket.getIn(['newMessage', 'receiver', 'name']),
                    email: ticket.getIn(['newMessage', 'receiver', 'email'])
                }
            case 'requester':
                return {
                    name: ticket.getIn(['requester', 'name']),
                    email: ticket.getIn(['requester', 'email'])
                }
            default:
                return {
                    name: this.defaultNames.empty,
                    email: ''
                }
        }
    }

    updateSearchInput(e) {
        this.refs.searchRequester.value = e.target.value
        this.refs.searchRequester.dispatchEvent(new Event('input'))
    }

    renderReceiver(obj, elem) {
        if (obj.channel !== this.channels.private) {
            elem.dropdown({
                allowAdditions: true,
                onChange: (text, value) => {
                    this.props.actions.ticket.setReceiver(text, value, obj.channel)
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

        const receiverEmail = receiver.name ? (
            <div className="receiver-email" key="email">
                <i className="icon mail"></i><span>{`<${receiver.email}>`}</span>
            </div>
        ) : null

        const receiverName = receiver.email ? (
            <div className="receiver-name" key="name"><b>{receiver.name}</b></div>
        ) : null

        return (
            <div className="ReplyMessageChannel">
                {/*
                    This hidden input mirrors the search input of the dropdown,
                    and is the one which Algolia listens to.
                */}
                <input
                    id="search-requester"
                    ref="searchRequester"
                    style={{ display: 'none'}}
                />

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
                        { [receiverName, receiverEmail]}
                        <div className="menu">
                            <div className="ui search input">
                                <input
                                    type="text"
                                    name="search"
                                    data-text={ticket.getIn(['state', 'query'])}
                                    value={ticket.getIn(['state', 'query'])}
                                    placeholder="Search users..."
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
