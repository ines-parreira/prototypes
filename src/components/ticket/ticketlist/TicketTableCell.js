import React, {PropTypes} from 'react'
import {formatDatetime} from '../../../utils'
import {AgentLabel, UserLabel, TagLabel, PriorityLabel, StatusLabel, ChannelLabel} from '../../utils/labels'

export default class TicketTableCell extends React.Component {
    constructor(props) {
        super()
        this.timezone = props.currentUser.get('timezone')
    }

    stripHTML = (text) => {
        try {
            const doc = document.implementation.createHTMLDocument()
            const body = doc.createElement('div')
            body.innerHTML = text

            const removeElements = body.querySelectorAll('style,script')
            for (let i = 0; i < removeElements.length; i++) {
                removeElements[i].remove()
            }
            return body.textContent || body.innerText
        } catch (e) {
            console.error(`Failed stripHTML: ${e}`, text)
            return text
        }
    }

    truncate = (text, length) => {
        text = this.stripHTML(text)
        const slice = text.slice(0, length)
        return slice !== text ? slice + ' ...' : text
    }

    renderFieldContent() {
        const {ticket} = this.props
        let {field} = this.props
        field = field.toJS()
        const value = ticket.getIn(field.name.split('.'))

        switch (field.type) {
            case 'plain':
                return value
            case 'datetime':
                return formatDatetime(value, this.timezone)
            case 'status':
                return <StatusLabel status={value}/>
            case 'composite':
                if (field.name === 'ticket-details') {
                    const firstMessage = ticket.get('messages').toJS()[0]
                    if (!firstMessage) {
                        return null
                    }
                    return (
                        <div className="ui header">
                            <span className="subject">{this.truncate(ticket.get('subject'), 50)}</span>
                            <div className="body sub header">
                                {this.truncate(firstMessage.body_html ? firstMessage.body_html : firstMessage.body_text, 50)}
                            </div>
                        </div>
                    )
                }
                console.error('Invalid composite field', field)
                return null
            case 'priority':
                return (<PriorityLabel priority={value}/>)
            case 'tags':
                return ticket.get('tags').map((tag) => (
                    <TagLabel key={`${ticket.get('id')}-${tag.get('id')}`}
                              tag={tag.toJS()}
                    />
                ))
            case 'agent':
                // ticket.requester.id => ticket.requester
                const agent = ticket.getIn(field.name.split('.').slice(0, -1))
                if (agent) {
                    return (
                        <AgentLabel agent={agent.toJS()}/>
                    )
                }
                return null
            case 'user':
                // ticket.requester.id => ticket.requester
                const user = ticket.getIn(field.name.split('.').slice(0, -1))
                if (user) {
                    return (
                        <UserLabel user={user.toJS()}/>
                    )
                }
                return null
            case 'channel':
                return <ChannelLabel channel={value}/>
            default:
                console.error('Invalid field type', field.type)
                return null
        }
    }

    render() {
        const {field} = this.props
        if (!field.get('visible')) {
            return null
        }

        let style = {}
        if (field.get('name') !== 'priority') {
            style = {minWidth: field.get('width')}
        }
        return (
            <td style={style} className={field.get('name')}>
                {this.renderFieldContent()}
            </td >
        )
    }
}

TicketTableCell.propTypes = {
    ticket: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
}
