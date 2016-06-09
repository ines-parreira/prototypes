import React, { PropTypes } from 'react'
import classnames from 'classnames'
import {Map, List} from 'immutable'
import SearchableDropdown from './SearchableDropdown'
import {SOURCE_VALUE_PROP} from '../../../../constants'
import {lastMessage} from '../../../../utils'
import _ from 'lodash'


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
     * @param onlyAddrs
     * @param ticket
     *
     * @returns {List}
     */
    getTargets(onlyAddrs = false, ticket = this.props.ticket) {
        if (!ticket.get('messages').size) {
            return List()
        }

        let to = List()
        const curTo = ticket.getIn(['newMessage', 'source', 'to'])
        const ticketLastMessage = ticket.get('messages').last()
        const valueProp = SOURCE_VALUE_PROP[ticketLastMessage.getIn(['source', 'type'])]

        if (curTo.size) {
            to = curTo
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
            to = List(to.map(dest => dest.get(valueProp).toString()))
        }

        return to
    }

    /**
     * This function gather and builds the data needed to render the receiver (name, mail, className of the icon, and its channel)
     *
     * @returns {string}
     */
    getClassNames() {
        const identity = this.resolveReceiver()
        const message = this.props.ticket.get('newMessage')
        const channel = message.getIn(['source', 'type'])
        const popupChannelClassNames = {
            default: 'action icon',
            private: 'action icon comment yellow',
            email: 'action icon mail blue',
            'facebook-message': 'action icon facebook square blue',
            'facebook-comment': 'action icon facebook blue'
        }

        if (!identity.id && !identity.email) {
            return popupChannelClassNames.email
        } else if (!message.get('public')) {
            return popupChannelClassNames.private
        } else if (Object.keys(popupChannelClassNames).indexOf(channel)) {
            return popupChannelClassNames[channel]
        }

        return popupChannelClassNames.default
    }

    /**
     * This gives us the name and the mail of the receiver depending on what is available in tickets.
     * This function is used in getReceiverData.
     *
     * @returns {{name: string, email: string}}
     */
    resolveReceiver() {
        const { ticket } = this.props

        let res = {
            name: 'select a receiver',
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

    /**
     * Wrapper around actions.ticket.updatePotentialRequesters, which crafts the query from the value before
     * sending it to the action.
     *
     * @param value: the string query from the user
     */
    updatePotentialRequesters(value) {
        const searchQuery = {
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

        _.set(searchQuery, 'query.filtered.query.multi_match.query', value)

        this.props.actions.ticket.updatePotentialRequesters(searchQuery)
    }

    /**
     * Callback passed to the SearchableDropdown component, for when a new value is added.
     *
     * @param value: the new value added
     * @param text: the text matching this value (its displayable pendant) (SemanticUI-specific)
     */
    addValue(value, text) {
        const splittedText = typeof text === 'string' ? text.split('&lt;') : []
        const fieldName = SOURCE_VALUE_PROP[this.props.ticket.getIn(['newMessage', 'source', 'type'])]

        if (this.props.ticket.getIn(['newMessage', 'source', 'to']).map(r => r.get(fieldName)).indexOf(value) !== -1) {
            return
        }

        const data = {
            name: splittedText.length > 1 ? _.trim(splittedText[0]) : '',
            id: (this.props.ticket.getIn(['state', 'potentialRequesters']).concat(this.getTargets()).find(
                receiver => receiver.get('address') === value
            ) || Map()).get('id')
        }

        data[fieldName] = value

        this.props.actions.ticket.addReceiver(data)
    }

    renderTo(ticket, actions) {
        const valueProp = SOURCE_VALUE_PROP[ticket.getIn(['newMessage', 'source', 'type'])]

        if (!ticket.getIn(['newMessage', 'public'])) {
            return <p className="receiver-placeholder">your team</p>
        }

        let optionValues = ticket.getIn(['state', 'potentialRequesters'])
        const targets = this.getTargets()

        if (!this.props.ticket.getIn(['state', 'query']) &&
            _.every(targets.map(target => optionValues.indexOf(target) === -1).toJS()) // verify that no element of targets is already in optionValues
        ) {
            optionValues = optionValues.concat(targets)
        }

        const parentId = ticket.get('messages').size ?
            `${ticket.get('id')} - ${ticket.get('messages').last().get('id')}` : 'new'

        return (
            <SearchableDropdown
                defaultValues={this.getTargets(true)}
                existingValues={ticket.getIn(['newMessage', 'source', 'to']).map(user => user.get(valueProp))}
                optionValues={optionValues}
                search={v => this.updatePotentialRequesters(v)}
                addValue={(v, t) => this.addValue(v, t)}
                removeValue={actions.ticket.removeReceiver}
                enabled={this.props.ticket.get('channel') !== 'facebook'}
                suffix="to"
                parentId={parentId.toString()}
                valueProp={SOURCE_VALUE_PROP[this.props.ticket.getIn(['newMessage', 'source', 'type'])]}
            />
        )
    }

    render() {
        const { ticket, actions } = this.props
        const popupClassNames = this.getClassNames()

        const ticketLastMessage = lastMessage(ticket.get('messages').toJS())

        const channelClassNames = {
            email: classnames('item', {
                disabled: ticketLastMessage ? ticketLastMessage.source.type !== 'email' : false
            }),
            facebookComment: classnames('item', {
                disabled: !ticket.get('id') || ticketLastMessage.source.type !== 'facebook-comment'
            }),
            facebookMessage: classnames('item', {
                disabled: !ticket.get('id') || ticketLastMessage.source.type !== 'facebook-message'
            }),
            internal: classnames('item', {
                disabled: !ticket.get('id')
            })
        }

        return (
            <div className="ReplyMessageChannel">
                <div className="channel-picker">

                    <div id="next-message-channel-popup" className="ui dropdown">
                        <i id="popup-message-channel" className={popupClassNames}/>
                        <div
                            className="ui vertical menu"
                            style={{ textAlign: 'left', border: 'none', width: 'inherit' }}
                        >
                            <div className={channelClassNames.email} onClick={() => actions.ticket.setSourceType('email')}>
                                Send as email
                            </div>
                            <div
                                className={channelClassNames.internal}
                                onClick={() => actions.ticket.setPublic(false)}
                            >
                                Send as internal note
                            </div>
                            <div className={channelClassNames.facebookComment} onClick={() => actions.ticket.setSourceType('facebook-comment')}>
                                Send as Facebook comment
                            </div>
                            <div className={channelClassNames.facebookMessage} onClick={() => actions.ticket.setSourceType('facebook-message')}>
                                Send as Facebook private message
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
