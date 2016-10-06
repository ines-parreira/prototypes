import React, {PropTypes} from 'react'
import _ from 'lodash'
import {stripHTML, lastMessage as getLastMessage} from '../../../../utils'
import {RenderLabel, TagLabel} from '../../../common/utils/labels'

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
                    <TagLabel key={`${ticket.get('id')}-${tag.get('id')}`}
                              tag={tag.toJS()}
                    />
                )).toJS()
            case 'address':
                if (field.name.startsWith('messages')) {
                    const path = field.name.split('.')

                    // insert a '0' in the path so that we look in the first message (messages.0. ...)
                    path.splice(path.indexOf('messages') + 1, 0, '0')

                    value = _.get(ticket.toJS(), path)
                }
                break
            case 'composite':
                if (field.name === 'ticket-details') {
                    const previewedMessage = getLastMessage(ticket.get('messages').toJS())

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
