import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {displayUserNameFromSource} from '../../common/utils'
import {stripHTML, lastMessage as getLastMessage, firstMessage as getFirstMessage} from '../../../../utils'
import {RenderLabel, TagLabel} from '../../../common/utils/labels'
import _get from 'lodash/get'

export default class TicketTableCell extends React.Component {
    _renderFieldContent = () => {
        const {ticket} = this.props
        const field = this.props.field.toJS()
        let value

        // customize values of some fields
        switch (field.type) {
            case 'agent':
            case 'user':
                // ticket.requester.id => ticket.requester
                value = ticket.getIn(field.name.split('.').slice(0, -1))
                if (value) {
                    value = value.toJS()
                }
                break
            case 'tags':
                return ticket.get('tags').map((tag) => (
                    <TagLabel
                        key={`${ticket.get('id')}-${tag.get('id')}`}
                        tag={tag.toJS()}
                    />
                )).toJS()
            case 'address':
                if (field.name.startsWith('messages')) {
                    const firstMessage = getFirstMessage(ticket.get('messages', fromJS([])).toJS())

                    if (!firstMessage) {
                        break
                    }

                    const path = field.name.split('.')
                    // remove "messages", lets keep the last message as the message we want to use
                    path.shift()

                    // "to" is an array so we want the first element in it
                    if (path.includes('to')) {
                        path.splice(path.indexOf('to') + 1, 0, 0)
                    }

                    // remove the "address" property, it depends actually on the type of the message
                    if (field.name.endsWith('address')) {
                        path.pop()
                    }

                    // get the part of "source" that we want
                    value = _get(firstMessage, path, '')
                    // display the user based on the message type
                    value = displayUserNameFromSource(value, firstMessage.source.type)
                }
                break
            case 'composite':
                if (field.name === 'ticket-details') {
                    const previewedMessage = getLastMessage(ticket.get('messages', fromJS([])).toJS())

                    if (!previewedMessage) {
                        break
                    }

                    // Optionally show how many messages a ticket has in the subject
                    let subject = stripHTML(ticket.get('subject'))
                    const messageCount = this.props.ticket.get('messages').size
                    if (messageCount > 1) {
                        subject = `(${messageCount}) ${subject}`
                    }

                    const body = previewedMessage.body_html ? stripHTML(previewedMessage.body_html) : previewedMessage.body_text

                    value = (
                        <div className="ui header">
                            <span className="subject">
                                {subject}
                            </span>
                            <div className="body sub header">
                                {body}
                            </div>
                        </div>
                    )
                } else {
                    console.error('Invalid composite field', field)
                }
                break
            default:
                value = ticket.getIn(field.name.split('.'))
        }

        return RenderLabel(field, value, this.props.currentUser.get('timezone'))
    }

    render() {
        const {field} = this.props

        if (!field.get('visible')) {
            return null
        }

        const style = {}
        if (field.get('name') !== 'priority') {
            style.minWidth = field.get('width')
        }

        return (
            <td
                style={style}
                className={field.get('name')}
            >
                {this._renderFieldContent()}
            </td >
        )
    }
}

TicketTableCell.propTypes = {
    ticket: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
}
