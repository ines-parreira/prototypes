import React, {PropTypes} from 'react'
import {StatusLabel} from './../../../../common/utils/labels'
import {formatDatetime, stripHTML, lastMessage as getLastMessage} from '../../../../../utils'
import {browserHistory} from 'react-router'
import classnames from 'classnames'


export default class TimelineTicket extends React.Component {
    _goToTicket = () => {
        this.props.actions.setCrossTickets({displayHistory: true})
        browserHistory.push(`/app/ticket/${this.props.ticket.get('id')}`)
    }

    render() {
        const {ticket} = this.props

        if (!ticket) {
            return null
        }

        const previewedMessage = getLastMessage(ticket.get('messages').toJS())

        if (!previewedMessage) {
            return null
        }

        // Optionally show how many messages a ticket has in the subject
        let subject = stripHTML(ticket.get('subject'))
        const messageCount = this.props.ticket.get('messages').size
        if (messageCount > 1) {
            subject = `(${messageCount}) ${subject}`
        }

        const body = previewedMessage.body_html ? stripHTML(previewedMessage.body_html) : previewedMessage.body_text

        return (
            <div
                className={classnames('TimelineTicket ui segment', {current: this.props.isCurrent})}
                onClick={this._goToTicket}
            >
                <div className="ui grid">

                    <div className="ten wide column">
                        <div className="ui header">
                            <span className="subject">
                                {subject}
                            </span>
                            <div className="body sub header">
                                {body}
                            </div>
                        </div>
                    </div>

                    <div className="two wide column">
                        <StatusLabel status={ticket.get('status')} />
                    </div>

                    <div className="four wide column">
                        <p className="created-datetime">{formatDatetime(ticket.get('created_datetime'))}</p>
                    </div>

                </div>
            </div>
        )
    }
}

TimelineTicket.propTypes = {
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    isCurrent: PropTypes.bool.isRequired
}
