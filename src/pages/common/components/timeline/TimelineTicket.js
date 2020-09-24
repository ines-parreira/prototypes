import React from 'react'
import PropTypes from 'prop-types'
import {browserHistory} from 'react-router'
import classnames from 'classnames'
import {Card, CardBody} from 'reactstrap'

import {StatusLabel, AgentLabel, DatetimeLabel} from '../../utils/labels'
import {stripHTML} from '../../../../utils.ts'

import SourceIcon from '../SourceIcon'

import css from './TimelineTicket.less'

export default class TimelineTicket extends React.Component {
    _goToTicket = (e) => {
        e.preventDefault()

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
                className={classnames(css.component, {
                    [css.current]: this.props.isCurrent,
                })}
                onClick={this._goToTicket}
                tag="a"
                href={`/app/ticket/${ticket.get('id')}`}
            >
                <CardBody className={classnames(css.body, 'd-flex')}>
                    <div className={css.meta}>
                        <StatusLabel
                            status={ticket.get('status')}
                            className="mb-2 mr-2"
                        />
                        <DatetimeLabel
                            dateTime={ticket.get('created_datetime')}
                            className="d-block mb-1"
                        />
                        {assigneeName && <AgentLabel name={assigneeName} />}
                    </div>
                    <div className={classnames(css.details)}>
                        <SourceIcon
                            type={ticket.get('channel')}
                            className={classnames(css.icon, 'uncolored')}
                        />
                        <h5 className={classnames(css.subject, 'mb-1')}>
                            {subject}
                        </h5>
                        <div className={classnames(css.excerpt, 'mb-2')}>
                            {ticket.get('excerpt')}
                        </div>
                    </div>
                </CardBody>
            </Card>
        )
    }
}

TimelineTicket.propTypes = {
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    isCurrent: PropTypes.bool.isRequired,
}

TimelineTicket.defaultProps = {
    actions: {},
    isCurrent: false,
}
