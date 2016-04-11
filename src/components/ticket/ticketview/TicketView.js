import React, { PropTypes } from 'react'
import classnames from 'classnames'

import TicketMessages from './TicketMessages'
import TicketReplyArea from './replyarea/TicketReplyArea'
import TicketSubmitButtons from './replyarea/TicketSubmitButtons'
import TicketTags from './tags/TicketTags'

import { TICKET_STATUSES } from './../../../constants'

export default class TicketView extends React.Component {
    componentDidMount() {
        $('#top-option-dropdown').dropdown({
            on: 'hover',
            action: 'nothing'
        })

        const ticketOwnerDropdown = $('#popup-ticket-owner')

        ticketOwnerDropdown.dropdown({
            inline: true,
            position: 'bottom left',
            hoverable: true,
            onChange: (value, text) => {
                const agent = this.props.users.get('agents').filter(agent => agent.get('name') === text).first()
                this.props.actions.ticket.setAgent(agent)
            }
        })
        $('#popup-ticket-status').popup({ inline: true, position: 'bottom right', hoverable: true, on: 'click' })
    }

    submit = (status) => {
        return (e) => {
            e.preventDefault()
            this.props.submit(status || this.props.ticket.get('status'))
        }
    }

    renderTicketOwner(ticket) {
        const assignee = ticket.getIn(['assignee_user', 'name']);

        if (assignee) {
            return (
                <span>
                    <span className="agent-label ui medium yellow label">A</span>
                    <span className="secondary-action">{assignee.toUpperCase()}</span>
                </span>
            )
        } else {
            return <span className="secondary-action">UNASSIGNED</span>
        }
    }

    render = () => {
        const { ticket, tags, users, actions } = this.props
        return (
            <div className="ticket-view">
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

                    <h1 className="ui header">{ticket.get('subject')}</h1>

                    <div className="ui grid">
                        <div className="row">

                            <div className="eight wide column">
                                <TicketTags
                                    ticketTags={ticket.get('tags')}
                                    tags={tags.get('items').toJS()}
                                    actions={actions}
                                />
                            </div>

                            <div className="eight wide column ticket-details">
                                <a
                                    className="ticket-flag-btn ticket-details-item"
                                    onClick={actions.ticket.togglePriority}
                                >
                                    <i
                                        className={classnames(
                                            'ticket-priority',
                                            ticket.get('priority') === 'high' ? '' : 'outline',
                                            'action',
                                            'icon',
                                            'flag'
                                        )}
                                    />
                                </a>

                                <div className="ticket-owner-btn ticket-details-item ui search button input pointing dropdown link item" id="popup-ticket-owner">
                                    {this.renderTicketOwner(ticket)}

                                    <div className="ui vertical menu">
                                        <div className="ui search input">
                                              <input id="ticket-owner-input" type="text" placeholder="Search agents..."/>
                                        </div>
                                        {
                                            users.get('agents').map((agent) =>
                                                <div
                                                    className="item"
                                                    key={agent.get('id')}
                                                    onClick={() => actions.ticket.setAgent(agent)}
                                                >
                                                    {agent.get('name')}
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>

                                <span className="ticket-id ticket-details-item">
                                    {`#${ticket.get('id')}`}
                                </span>

                                <a id="popup-ticket-status" className={`ticket-status ticket-details-item ui ${ticket.get('status')} label`}>
                                    {ticket.get('status')}
                                </a>

                                <div className="ui popup">
                                    <div
                                        className="ui vertical menu"
                                        style={{ textAlign: 'left', border: 'none', width: 'inherit' }}
                                    >

                                    {TICKET_STATUSES.map((status) =>
                                        <button
                                            className={`item ticket-status ticket-details-item ui ${status} label`}
                                            key={status}
                                            onClick={() => actions.ticket.setStatus(status)}
                                        >
                                            {status}
                                        </button>
                                    )}

                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>

                <TicketMessages
                    currentUser={this.props.currentUser}
                    messages={ticket.get('messages')}
                />

                <TicketReplyArea
                    actions={this.props.actions}
                    applyMacro={this.props.applyMacro}
                    previewMacro={this.props.actions.macro.previewMacro}
                    currentUser={this.props.currentUser}
                    macros={this.props.macros}
                    ticket={this.props.ticket}
                />

                <TicketSubmitButtons
                    ticket={ticket}
                    submit={this.submit}
                />

            </div>
        )
    }
}

TicketView.propTypes = {
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    macros: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    applyMacro: PropTypes.func.isRequired,
    pushState: PropTypes.func,
    tags: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired
}
