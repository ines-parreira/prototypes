import React, { PropTypes } from 'react'
import classnames from 'classnames'
import {Map, List} from 'immutable'
import SearchableDropdown from './SearchableDropdown'
import {SOURCE_VALUE_PROP} from '../../../../constants'
import {firstMessage} from '../../../../utils'
import {getLastNonInternalNoteMessage} from '../../../../reducers/ticket'
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
        const curTo = ticket.getIn(['newMessage', 'source', 'to'])
        // We want the last message that was not an internal note.
        const ticketLastMessage = getLastNonInternalNoteMessage(ticket.get('messages'))

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
            const valueProp = SOURCE_VALUE_PROP[ticketLastMessage.getIn(['source', 'type'])]
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
        const message = this.props.ticket.get('newMessage')
        const channel = message.getIn(['source', 'type'])
        const popupChannelClassNames = {
            default: 'action icon',
            private: 'action icon comment yellow',
            email: 'action icon mail blue',
            chat: 'action icon purple comments',
            'facebook-comment': 'action icon facebook square blue',
            'facebook-message': 'action icon facebook-messenger blue'
        }

        if (!message.get('public')) {
            return popupChannelClassNames.private
        } else if (Object.keys(popupChannelClassNames).indexOf(channel) !== -1) {
            return popupChannelClassNames[channel]
        }

        return popupChannelClassNames.default
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
                receiver => receiver.get(fieldName) === value
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
                channel={this.props.ticket.get('channel')}
            />
        )
    }

    render() {
        const { ticket, actions } = this.props
        const popupClassNames = this.getClassNames()

        const ticketFirstMessage = firstMessage(ticket.get('messages').toJS())

        const channelClassNames = {
            email: classnames('item', {
                hidden: !ticket.get('id') ? false : ticketFirstMessage.source.type !== 'email'
            }),
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
                        <i id="popup-message-channel" className={popupClassNames}/>
                        <div
                            className="ui vertical menu"
                            style={{ textAlign: 'left', border: 'none', width: 'inherit' }}
                        >
                            <div className={channelClassNames.email} onClick={() => actions.ticket.setSourceType('email')}>
                                Send as email
                            </div>
                            <div className={channelClassNames.chat} onClick={() => actions.ticket.setSourceType('chat')}>
                                Send as chat message
                            </div>
                            <div className={channelClassNames.facebookComment} onClick={() => actions.ticket.setSourceType('facebook-comment')}>
                                Send as Facebook comment
                            </div>
                            <div className={channelClassNames.facebookMessage} onClick={() => actions.ticket.setSourceType('facebook-message')}>
                                Send as Facebook private message
                            </div>
                            <div className={channelClassNames.internal} onClick={() => actions.ticket.setSourceType('internal-note')}>
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
