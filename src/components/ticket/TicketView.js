import React, { PropTypes } from 'react'
import classnames from 'classnames'

import TicketMessages from './TicketMessages'
import TicketReplyArea from './TicketReplyArea'
import TicketSubmitButtons from './TicketSubmitButtons'
import TicketTags from './tags/TicketTags'

export default class TicketView extends React.Component {
    componentDidMount() {
        $('#top-option-dropdown').dropdown({
            on: 'hover',
            action: 'nothing'
        })
        $('#popup-ticket-owner').popup({ inline: true, position: 'bottom left', hoverable: true, on: 'click' })
    }
    submit = (status) => {
        return (e) => {
            e.preventDefault()
            this.props.submit(status || this.props.ticket.get('status'))
        }
    }

    render = () => {
        const { ticket, tags, users } = this.props
        return (
            <div className="ticket-view">
                <div className="ticket-header">
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

                    <button className="ticket-previous-btn ui mini button">
                        3 PREVIOUS TICKETS
                    </button>

                    <h1 className="ui header">{ticket.get('subject')}</h1>
                    <div className="ui grid">
                        <div className="row">
                            <div className="eight wide column">
                                <TicketTags
                                    ticketTags={ticket.get('tags')}
                                    tags={tags.get('items')}
                                    actions={this.props.actions}
                                />
                            </div>
                            <div className="eight wide column ticket-details">
                                <a
                                    className="ticket-flag-btn ticket-details-item"
                                    onClick={this.props.actions.ticket.togglePriority}
                                >
                                    <i
                                        className={classnames(
                                            'ticket-priority',
                                            ticket.get('priority'),
                                            'icon',
                                            'flag',
                                            { outline: ticket.priority !== 'high' }
                                        )}
                                    />
                                </a>

                                <a className="ticket-owner-btn ticket-details-item" id="popup-ticket-owner">
                                    <span className="ui yellow label">A</span>
                                    {ticket.getIn(['assignee_user', 'name'])}
                                </a>

                                <div className="ui popup">
                                    <div
                                        className="ui vertical menu"
                                        style={{ textAlign: 'left', border: 'none', width: 'inherit' }}
                                    >

                                      {users.get('agents').map((agent) =>
                                          <a
                                              className="item"
                                              key={agent.id}
                                              onClick={() => this.props.actions.ticket.setAgent(agent)}
                                          >{agent.name}</a>
                                      )}

                                    </div>
                                </div>

                                <span className="ticket-id ticket-details-item">
                                    {`#${ticket.get('id')}`}
                                </span>

                                <span className={`ticket-status ticket-details-item ui ${ticket.get('status')} label`}>
                                    {ticket.get('status')}
                                </span>
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
                    ticket={ticket}
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
