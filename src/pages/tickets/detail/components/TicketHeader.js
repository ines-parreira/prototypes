import React, { PropTypes } from 'react'

import EditableTitle from './../../common/components/EditableTitle'
import TicketTags from './ticketdetails/TicketTags'
import TicketPriority from './ticketdetails/TicketPriority'
import TicketStatus from './ticketdetails/TicketStatus'
import TicketAssignee from './ticketdetails/TicketAssignee'


export default class TicketHeader extends React.Component {
    shouldComponentUpdate(nextProps) {
        const currentTicket = this.props.ticket.delete('newMessage').delete('messages').delete('state')
        const nextTicket = nextProps.ticket.delete('newMessage').delete('messages').delete('state')

        const currentTags = this.props.tags
        const nextTags = nextProps.tags

        const currentAgents = this.props.agents
        const nextAgents = nextProps.agents

        return !currentTicket.equals(nextTicket) || !currentTags.equals(nextTags) || !currentAgents.equals(nextAgents)
    }

    render() {
        const {ticket, tags, agents, actions, computeNextUrl, hideTicket} = this.props

        let ticketId = ''

        if (ticket.get('id')) {
            ticketId = `#${ticket.get('id')}`
        }

        return (
            <div className="ticket-header">

                {/*
                 <div className="ticket-actions-btn ui dropdown" id="top-option-dropdown">
                 <i className="ui icon angle down"/>
                 <div className="menu transition">
                 <div className="item">
                 <a href="#">
                 Merge
                 </a>
                 </div>
                 <div className="item">
                 <a href="#">
                 Mark as spam
                 </a>
                 </div>
                 </div>
                 </div>
                 */}

                {/*
                 <button className="ticket-previous-btn ui mini button">
                 NO PREVIOUS TICKETS
                 </button>
                 */}

                <EditableTitle
                    title={ticket.get('subject')}
                    placeholder="Subject"
                    update={actions.ticket.setSubject}
                    focus={!ticket.get('id')}
                />

                <div className="ui grid ticket-header-details">
                    <div className="row">

                        <div className="eleven wide column">
                            <TicketStatus
                                currentStatus={ticket.get('status')}
                                setStatus={actions.ticket.setStatus}
                                computeNextUrl={computeNextUrl}
                                hideTicket={hideTicket}
                            />

                            <TicketTags
                                tags={tags.get('items').toJS()}
                                ticketTags={ticket.get('tags')}
                                addTag={actions.ticket.addTags}
                                removeTag={actions.ticket.removeTag}
                            />
                        </div>

                        <div className="five wide column ticket-details">
                            <TicketPriority
                                priority={ticket.get('priority')}
                                togglePriority={actions.ticket.togglePriority}
                            />

                            <TicketAssignee
                                currentAssignee={ticket.getIn(['assignee_user', 'name'])}
                                agents={agents}
                                setAgent={actions.ticket.setAgent}
                            />

                            <span className="ticket-id ticket-details-item">
                                {ticketId}
                            </span>
                        </div>

                    </div>
                </div>

            </div>
        )
    }
}

TicketHeader.propTypes = {
    ticket: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,

    computeNextUrl: PropTypes.func.isRequired,
    hideTicket: PropTypes.func.isRequired
}
