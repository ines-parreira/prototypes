import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import ReceiversDropdown from './ReceiversDropdown'
import {SOURCE_VALUE_PROP} from '../../../../../config'
import {firstMessage} from '../../../../../utils'
import {isTicketDifferent} from './../../../common/utils'
import {getLastSameSourceTypeMessage} from '../../../../../state/ticket/utils'
import _set from 'lodash/set'

export default class ReplyMessageChannel extends React.Component {
    componentDidMount() {
        $(this.refs.messageChannel).dropdown({
            position: 'bottom left',
            hoverable: true,
            on: 'click'
        })
    }

    shouldComponentUpdate(nextProps) {
        return isTicketDifferent(this.props.ticket, nextProps.ticket) || !this.props.settings.equals(nextProps.settings)
    }

    _initialReceivers() {
        const ticket = this.props.ticket
        let receivers = fromJS([])
        const messages = ticket.get('messages', fromJS([]))

        if (!messages.size) {
            return receivers
        }

        const sourceType = ticket.getIn(['newMessage', 'source', 'type'])
        const lastMessage = getLastSameSourceTypeMessage(messages, sourceType)

        if (lastMessage) {
            if (lastMessage.get('from_agent')) {
                receivers = lastMessage.getIn(['source', 'to'])
            } else {
                receivers = fromJS([lastMessage.getIn(['source', 'from'])])
            }
        }

        return receivers.filter(receiver => !!receiver) // remove falsey values
    }

    /**
     * This function gather and builds the data needed to render the receiver
     * (name, mail, className of the icon, and its channel).
     *
     * @returns {string}
     */
    getClassNames() {
        const message = this.props.ticket.get('newMessage')
        const channel = message.getIn(['source', 'type'])
        const popupChannelClassNames = {
            default: 'action icon',
            private: 'action icon comment yellow',
            email: 'action icon mail blue',
            chat: 'action icon purple comments',
            api: 'action icon code',
            'facebook-comment': 'action icon facebook square blue',
            'facebook-message': 'action icon facebook-messenger blue'
        }

        if (!message.get('public')) {
            return popupChannelClassNames.private
        } else if (~Object.keys(popupChannelClassNames).indexOf(channel)) {
            return popupChannelClassNames[channel]
        }

        return popupChannelClassNames.default
    }

    _searchQuery(searchValue) {
        const query = {
            _source: ['id', 'address', 'type', 'user'],
            size: 5,
            query: {
                filtered: {
                    filter: {
                        bool: {
                            must: [{
                                match: {
                                    type: this.props.ticket.getIn(['newMessage', 'channel'])
                                }
                            }]
                        }
                    },
                    query: {
                        multi_match: {
                            query: '',
                            fuzziness: 3,
                            fields: ['address', 'user.name'],
                            type: 'phrase_prefix'
                        }
                    }
                }
            }
        }

        _set(query, 'query.filtered.query.multi_match.query', searchValue)

        return query
    }

    setSourceType(sourceType) {
        this.props.actions.ticket.setSourceType(sourceType)
    }

    renderTo(ticket, actions) {
        if (!ticket.getIn(['newMessage', 'public'])) {
            return <div className="receiver-placeholder">Your team</div>
        }

        const parentId = ticket.get('messages').size
            ? `${ticket.get('id', '')} - ${ticket.get('messages', fromJS([])).last().get('id', '')}`
            : 'new'

        const disabledChannels = ['facebook-post', 'facebook-message', 'chat', 'api']

        const isInputEnabled =
            !~disabledChannels.indexOf(this.props.ticket.getIn(['newMessage', 'source', 'type'])) || !ticket.get('id')

        return (
            <ReceiversDropdown
                actions={actions}
                initialValues={this._initialReceivers()}
                generateQuery={v => this._searchQuery(v)}
                enabled={isInputEnabled}
                value={this.props.ticket.getIn(['newMessage', 'source', 'to']).toJS()}
                parentId={parentId.toString()}
                valueProp={SOURCE_VALUE_PROP[this.props.ticket.getIn(['newMessage', 'source', 'type'])]}
                sourceType={this.props.ticket.getIn(['newMessage', 'source', 'type'])}
            />
        )
    }

    render() {
        const {ticket, actions} = this.props
        const popupClassNames = this.getClassNames()

        const ticketFirstMessage = firstMessage(ticket.get('messages').toJS())

        if (!ticketFirstMessage) {
            return null
        }

        const channelClassNames = {
            email: 'item',
            chat: classnames('item', {
                hidden: !ticket.get('id') ? true : ticketFirstMessage.source.type !== 'chat'
            }),
            facebookComment: classnames('item', {
                hidden: !ticket.get('id') || ticketFirstMessage.source.type !== 'facebook-post'
            }),
            facebookMessage: classnames('item', {
                hidden: !ticket.get('id') || ticketFirstMessage.source.type !== 'facebook-message'
            }),
            internal: classnames('item', {
                hidden: !ticket.get('id')
            })
        }

        return (
            <div className="ReplyMessageChannel">
                <div className="channel-picker">
                    <div
                        ref="messageChannel"
                        className="ui dropdown"
                    >
                        <i className={popupClassNames} />
                        <i className="icon caret down" />
                        <div
                            className="ui vertical menu"
                            style={{textAlign: 'left', border: 'none', width: 'inherit', marginTop: '8px'}}
                        >
                            <div
                                className={channelClassNames.email}
                                onClick={() => this.setSourceType('email')}
                            >
                                Send as email
                            </div>
                            <div
                                className={channelClassNames.chat}
                                onClick={() => this.setSourceType('chat')}
                            >
                                Send as chat message
                            </div>
                            <div
                                className={channelClassNames.facebookComment}
                                onClick={() => this.setSourceType('facebook-comment')}
                            >
                                Send as Facebook comment
                            </div>
                            <div
                                className={channelClassNames.facebookMessage}
                                onClick={() => this.setSourceType('facebook-message')}

                            >
                                Send as Facebook private message
                            </div>
                            <div
                                className={channelClassNames.internal}
                                onClick={() => this.setSourceType('internal-note')}
                            >
                                Send as internal note
                            </div>
                        </div>
                    </div>

                    <span className="label to">To: </span>
                </div>

                {this.renderTo(ticket, actions)}
            </div>
        )
    }
}

ReplyMessageChannel.propTypes = {
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
}
