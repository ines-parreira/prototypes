import React, {Component, MouseEvent} from 'react'
import classnames from 'classnames'
import {Card, CardBody} from 'reactstrap'
import {Map} from 'immutable'

import history from '../../../history'
import {StatusLabel, AgentLabel, DatetimeLabel} from '../../utils/labels.js'
import {stripHTML} from '../../../../utils'
import {displayHistoryOnNextPage} from '../../../../state/ticket/actions'

import SourceIcon from '../SourceIcon'

import css from './TimelineTicket.less'

type Props = {
    displayHistoryOnNextPage?: typeof displayHistoryOnNextPage
    isCurrent: boolean
    ticket: Map<any, any>
}

export default class TimelineTicket extends Component<Props> {
    static defaultProps: Pick<Props, 'isCurrent'> = {isCurrent: false}

    _goToTicket = (e: MouseEvent) => {
        e.preventDefault()

        if (this.props.displayHistoryOnNextPage) {
            this.props.displayHistoryOnNextPage(true)
        }

        history.push(`/app/ticket/${this.props.ticket.get('id') as number}`)
    }

    render() {
        const {ticket} = this.props

        if (!ticket) {
            return null
        }

        // Optionally show how many messages a ticket has in the subject
        let subject = stripHTML(ticket.get('subject')) as string

        const messageCount = ticket.get('messages_count') as number
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
                href={`/app/ticket/${ticket.get('id') as string}`}
            >
                <CardBody className={classnames(css.body, 'd-flex')}>
                    <div className={css.meta}>
                        <StatusLabel
                            status={ticket.get('status')}
                            // @ts-ignore remove after StatusLabel is migrated to TS
                            className="mb-2 mr-2"
                        />
                        <DatetimeLabel
                            dateTime={ticket.get('created_datetime')}
                            // @ts-ignore remove after StatusLabel is migrated to TS
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
