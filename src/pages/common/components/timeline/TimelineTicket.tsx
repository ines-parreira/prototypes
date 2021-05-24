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
                <CardBody
                    className={classnames(
                        css.body,
                        'd-flex',
                        'align-items-start'
                    )}
                >
                    <div className={css.meta}>
                        <StatusLabel
                            status={ticket.get('status')}
                            // $TsFixMe: remove after StatusLabel is migrated to TS
                            // @ts-ignore
                            className={classnames(css.statusLabel)}
                        />
                        {assigneeName ? (
                            <AgentLabel
                                name={assigneeName}
                                className={css.assigneeLabel}
                            />
                        ) : (
                            <div
                                className={classnames(
                                    css.assigneeLabel,
                                    css.unassignedLabel
                                )}
                            >
                                <span className="material-icons md-2">
                                    error
                                </span>
                                <span>Unassigned</span>
                            </div>
                        )}
                    </div>
                    <div className={classnames(css.details)}>
                        <h5 className={css.subject}>{subject}</h5>
                        <div className={css.excerpt}>
                            {ticket.get('excerpt')}
                        </div>
                    </div>
                    <div
                        className={classnames(
                            css.secondMeta,
                            'd-flex',
                            'align-items-center',
                            'justify-content-end'
                        )}
                    >
                        <DatetimeLabel
                            dateTime={ticket.get('created_datetime')}
                            breakDate
                            // $TsFixMe: remove after DatetimeLabel is migrated to TS
                            // @ts-ignore
                            className={classnames(css.dateLabel)}
                        />
                        <SourceIcon
                            type={ticket.get('channel')}
                            className={classnames('uncolored', 'ml-3')}
                        />
                    </div>
                </CardBody>
            </Card>
        )
    }
}
