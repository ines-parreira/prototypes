import React, { PropTypes } from 'react'
import classnames from 'classnames'

import TicketMessages from './TicketMessages'
import TicketReplyArea from './replyarea/TicketReplyArea'
import TicketSubmitButtons from './replyarea/TicketSubmitButtons'
import TicketTags from './TicketTags'
import ReplyMessageChannel from './ReplyMessageChannel'

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

    toggleSubjectEditMode = () => {
        const reinitSubject = function (subjObject) {
            subjObject.classList.remove('edit-mode')
            subjObject.setAttribute('contentEditable', 'false')
            subjObject.onkeypress = null
            subjObject.onkeyup = null
        }

        const self = this
        const subjectObject = document.getElementById('ticket-subject')

        subjectObject.classList.add('edit-mode')
        subjectObject.setAttribute('contentEditable', 'true')
        subjectObject.focus()

        subjectObject.onkeypress = function (e) {
            if (e.keyCode === 13) { e.preventDefault() }
        }

        subjectObject.onkeyup = function (e) {
            if (e.keyCode === 13 || e.keyCode === 27) {
                e.preventDefault()

                reinitSubject(subjectObject)

                if (e.keyCode === 13) {
                    self.props.actions.ticket.setSubject(subjectObject.innerText)
                } else {
                    subjectObject.innerText = self.props.ticket.get('subject')
                }
            }
        }

        subjectObject.onblur = function () {
            reinitSubject(subjectObject)
            self.props.actions.ticket.setSubject(subjectObject.innerText)
        }
    }

    submit = (status, next) => {
        return (e) => {
            e.preventDefault()
            this.props.submit(status || this.props.ticket.get('status'), next)
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
        }

        return <span className="secondary-action">UNASSIGNED</span>
    }

    render = () => {
        const { ticket, tags, users, actions } = this.props

        let ticketId = ''

        if (ticket.get('id')) { ticketId = `#${ticket.get('id')}`}

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

                    <h1
                        id="ticket-subject"
                        placeholder="Subject"
                        className="ui header"
                        onClick={() => this.toggleSubjectEditMode()}
                    >
                        {ticket.get('subject')}
                    </h1>


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
                                    {ticketId}
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

                <ReplyMessageChannel
                    ticket={this.props.ticket}
                    actions={this.props.actions}
                    settings={this.props.settings}
                />

                <TicketReplyArea
                    actions={this.props.actions}
                    applyMacro={this.props.applyMacro}
                    previewMacro={this.props.actions.macro.previewMacro}
                    currentUser={this.props.currentUser}
                    users={this.props.users}
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
    tags: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,

    submit: PropTypes.func.isRequired,
    applyMacro: PropTypes.func.isRequired,
}
