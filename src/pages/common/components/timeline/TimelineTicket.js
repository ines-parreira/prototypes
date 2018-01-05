import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import classnames from 'classnames'
import {Card, CardBlock} from 'reactstrap'

import {StatusLabel, AgentLabel, DatetimeLabel} from '../../utils/labels'
import {stripHTML} from '../../../../utils'

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
        const assigneeName = ticket.getIn(['assignee_user', 'name'])

        return (
            <Card
                className={classnames('TimelineTicket', {current: this.props.isCurrent})}
                onClick={this._goToTicket}
                tag="a"
                href={`/app/ticket/${ticket.get('id')}`}
            >
                <CardBlock>
                    <div>
                        <h5 className="mb-1">
                            {subject}
                        </h5>
                        <div>
                            {ticket.get('excerpt')}
                        </div>
                    </div>
                    <div>
                        {assigneeName && (
                            <AgentLabel name={assigneeName}/>
                        )}
                    </div>
                    <div>
                        <StatusLabel status={ticket.get('status')}/>
                    </div>
                    <div>
                        <DatetimeLabel
                            dateTime={ticket.get('created_datetime')}
                            settings={{
                                position: 'top left'
                            }}
                        />
                    </div>
                </CardBlock>
            </Card>
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

