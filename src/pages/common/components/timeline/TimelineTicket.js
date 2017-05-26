import React, {PropTypes} from 'react'
import {StatusLabel} from '../../utils/labels'
import {formatDatetime, stripHTML, getLastMessage} from '../../../../utils'
import {browserHistory} from 'react-router'
import classnames from 'classnames'


export default class TimelineTicket extends React.Component {
    _goToTicket = () => {
        if (this.props.actions.displayHistoryOnNextPage) {
            this.props.actions.displayHistoryOnNextPage(true)
        }

        browserHistory.push(`/app/ticket/${this.props.ticket.get('id')}`)
    }

    render() {
        const {ticket} = this.props

        if (!ticket) {
            return null
        }

        // Optionally show how many messages a ticket has in the subject
        let subject = stripHTML(ticket.get('subject'))

        const messageCount = ticket.get('messages_count')
        if (messageCount > 1) {
            subject = `(${messageCount}) ${subject}`
        }

        return (
            <div
                className={classnames('TimelineTicket ui segment', {current: this.props.isCurrent})}
                onClick={this._goToTicket}
            >
                <div>
                    <div className="ui header">
                        <span className="subject">
                            {subject}
                        </span>
                        <div className="body sub header">
                            {ticket.get('excerpt')}
                        </div>
                    </div>
                </div>

                <div>
                    <StatusLabel status={ticket.get('status')} />
                </div>

                <div>
                    <p className="created-datetime text-center">{formatDatetime(ticket.get('created_datetime'))}</p>
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

TimelineTicket.defaultProps = {
    actions: {},
    isCurrent: false
}

