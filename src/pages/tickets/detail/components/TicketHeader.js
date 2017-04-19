import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'

import EditableTitle from '../../../common/components/EditableTitle'
import TicketTags from './ticketdetails/TicketTags'
import TicketStatus from './ticketdetails/TicketStatus'
import TicketAssignee from './ticketdetails/TicketAssignee'

export default class TicketHeader extends React.Component {
    shouldComponentUpdate(nextProps) {
        const currentTicket = this.props.ticket.delete('newMessage').delete('messages').delete('state')
        const nextTicket = nextProps.ticket.delete('newMessage').delete('messages').delete('state')

        return !currentTicket.equals(nextTicket)
    }

    _toggleStatus = (status) => {
        const newStatus = status === 'closed' ? 'open' : 'closed'
        return this._setStatus(newStatus)
    }

    _setStatus = (status) => {
        const {actions, computeNextUrl, hideTicket} = this.props

        const nextUrl = computeNextUrl(true)

        actions.ticket.setStatus(status, () => {
            // redirect to the next ticket after the transition is done.
            if (nextUrl) {
                hideTicket()
                // delay redirect to let the hiding animation appear
                setTimeout(() => browserHistory.push(nextUrl), 300)
            }
        })
    }

    render() {
        const {ticket, actions} = this.props

        const isUpdate = !!ticket.get('id')

        return (
            <div className="ticket-header">
                <EditableTitle
                    className="mb-2"
                    title={ticket.get('subject')}
                    placeholder="Subject"
                    update={actions.ticket.setSubject}
                    focus={!ticket.get('id')}
                />

                <div className="d-flex justify-content-between">
                    <div className="d-inline-flex">
                        {
                            isUpdate && (
                                <TicketStatus
                                    currentStatus={ticket.get('status')}
                                    setQuickStatus={this._toggleStatus}
                                />
                            )
                        }

                        <TicketTags
                            ticketTags={ticket.get('tags')}
                            addTags={actions.ticket.addTags}
                            removeTag={actions.ticket.removeTag}
                        />
                    </div>

                    <TicketAssignee
                        direction="right"
                        currentAssignee={ticket.getIn(['assignee_user', 'name'])}
                        setAgent={actions.ticket.setAgent}
                    />
                </div>
            </div>
        )
    }
}

TicketHeader.propTypes = {
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,

    computeNextUrl: PropTypes.func.isRequired,
    hideTicket: PropTypes.func.isRequired,
}
