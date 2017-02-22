import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'

import EditableTitle from '../../../common/components/EditableTitle'
import TicketTags from './ticketdetails/TicketTags'
import TicketPriority from './ticketdetails/TicketPriority'
import TicketStatus from './ticketdetails/TicketStatus'
import TicketAssignee from './ticketdetails/TicketAssignee'

import {getAgents} from '../../../../state/users/selectors'

class TicketHeader extends React.Component {
    shouldComponentUpdate(nextProps) {
        const currentTicket = this.props.ticket.delete('newMessage').delete('messages').delete('state')
        const nextTicket = nextProps.ticket.delete('newMessage').delete('messages').delete('state')

        const currentAgents = this.props.agents
        const nextAgents = nextProps.agents

        return !currentTicket.equals(nextTicket) || !currentAgents.equals(nextAgents)
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
        const {ticket, agents, actions} = this.props

        const isUpdate = !!ticket.get('id')

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
                    style={{width: '100%'}}
                />

                <div className="ui grid ticket-header-details">
                    <div className="row">

                        <div className="eleven wide column">
                            {
                                isUpdate && (
                                    <TicketStatus
                                        currentStatus={ticket.get('status')}
                                        setStatus={this._setStatus}
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
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

TicketHeader.propTypes = {
    ticket: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,

    computeNextUrl: PropTypes.func.isRequired,
    hideTicket: PropTypes.func.isRequired,
}


function mapStateToProps(state) {
    return {
        agents: getAgents(state),
    }
}

function mapDispatchToProps() {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketHeader)
