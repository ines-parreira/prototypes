import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {List} from 'immutable'
import _ from 'lodash'
import ReceiversDropdown from './ReceiversDropdown'
import {SOURCE_VALUE_PROP} from '../../../../../config'
import {firstMessage} from '../../../../../utils'
import {getLastSameSourceTypeMessage} from '../../../../../state/ticket/reducers'

export default class ReplyMessageChannel extends React.Component {
    componentDidMount() {
        $('#next-message-channel-popup').dropdown({
            position: 'bottom left',
            hoverable: true,
            on: 'click'
        })
    }

    /**
     * Return the default `to` of the next message:
     * - if the last message is `from_agent`, the `to` list of this message
     * - if not, the `from` of this message
     *
     * @param onlyAddrs: true to get just the displayed value for the 'to' field.
     * @param ticket
     *
     * @returns {List}
     */
    getTargets(onlyAddrs = false, ticket = this.props.ticket) {
        // TODO@ldirer Currently the dropdown has its value set, triggering onChange, which in turns causes the reducer to set the 'to' field in the source.
        // This feels a bit awkward. We get the value to display in 'to:' from the *last message* instead of taking it directly from the state.

        if (!ticket.get('messages').size) {
            return List()
        }

        let to = List()
        const currentTo = ticket.getIn(['newMessage', 'source', 'to'])
        // We want the last message that was not an internal note.
        const ticketLastMessage = getLastSameSourceTypeMessage(ticket.get('messages'), ticket.getIn(['newMessage', 'source', 'type']))

        if (!ticketLastMessage) {
            return List()
        }

        if (currentTo.size) {
            to = currentTo
        } else {
            if (ticketLastMessage) {
                if (ticketLastMessage.get('from_agent')) {
                    to = ticketLastMessage.getIn(['source', 'to'])
                } else {
                    to = List([ticketLastMessage.getIn(['source', 'from'])])
                }
            }
        }

        if (onlyAddrs) {
            const valueProp = SOURCE_VALUE_PROP[ticket.getIn(['newMessage', 'source', 'type'])]

            if (valueProp) {
                to = List(to.map(dest => dest.get(valueProp).toString()))
            }
        }

        return to
    }

    /**
     * This function gather and builds the data needed to render the receiver (name, mail, className of the icon, and its channel)
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

        _.set(query, 'query.filtered.query.multi_match.query', searchValue)

        return query
    }

    setSourceType(sourceType) {
        this.props.actions.ticket.setSourceType(sourceType)
    }

    renderTo(ticket, actions) {
        const valueProp = SOURCE_VALUE_PROP[ticket.getIn(['newMessage', 'source', 'type'])]

        if (!ticket.getIn(['newMessage', 'public'])) {
            return <p className="receiver-placeholder">your team</p>
        }

        let initialValues = List()
        const targets = this.getTargets()

        // check that no element of targets is already in initialValues
        if (!this.props.ticket.getIn(['state', 'query']) &&
            _.every(targets.map(target => !~initialValues.indexOf(target)).toJS())) {
            initialValues = initialValues.concat(targets)
        }

        const parentId = ticket.get('messages').size ?
            `${ticket.get('id')} - ${ticket.get('messages').last().get('id')}` : 'new'

        const disabledChannels = ['facebook-post', 'facebook-message', 'chat', 'api']

        const isInputEnabled =
            !~disabledChannels.indexOf(this.props.ticket.getIn(['newMessage', 'source', 'type'])) || !ticket.get('id')

        return (
            <ReceiversDropdown
                actions={actions}
                existingValues={ticket.getIn(['newMessage', 'source', 'to']).map(user => user.get(valueProp))}
                initialValues={initialValues}
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

        const channelClassNames = {
            email: 'item',
            chat: classnames('item', {
                hidden: !ticket.get('id') ? false : ticketFirstMessage.source.type !== 'chat'
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

                    <div id="next-message-channel-popup" className="ui dropdown">
                        <i id="popup-message-channel" className={popupClassNames} />
                        <div
                            className="ui vertical menu"
                            style={{textAlign: 'left', border: 'none', width: 'inherit'}}
                        >
                            <div className={channelClassNames.email} onClick={() => this.setSourceType('email')}>
                                Send as email
                            </div>
                            <div className={channelClassNames.chat} onClick={() => this.setSourceType('chat')}>
                                Send as chat message
                            </div>
                            <div className={channelClassNames.facebookComment}
                                 onClick={() => this.setSourceType('facebook-comment')}
                            >
                                Send as Facebook comment
                            </div>
                            <div className={channelClassNames.facebookMessage}
                                 onClick={() => this.setSourceType('facebook-message')}

                            >
                                Send as Facebook private message
                            </div>
                            <div className={channelClassNames.internal}
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
