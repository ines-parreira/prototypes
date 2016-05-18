import React, { PropTypes } from 'react'
import _ from 'lodash'

import EditableTitle from './../EditableTitle'
import TicketMessages from './TicketMessages'
import TicketReplyArea from './replyarea/TicketReplyArea'
import TicketSubmitButtons from './replyarea/TicketSubmitButtons'
import TicketTags from './ticketdetails/TicketTags'
import TicketPriority from './ticketdetails/TicketPriority'
import TicketAssignee from './ticketdetails/TicketAssignee'
import TicketStatus from './ticketdetails/TicketStatus'
import ReplyMessageChannel from './replyarea/ReplyMessageChannel'

export default class TicketView extends React.Component {
    // USED ONLY BY THE COMMENTED DROPDOWN BELOW
    // componentDidMount() {
    //     $('#top-option-dropdown').dropdown({
    //         on: 'hover',
    //         action: 'nothing'
    //     })
    // }

    componentWillReceiveProps(nextProps) {
        if (
            /**
             * The code below is used to initialize a new Ticket being created with the constraints of the view
             * on which the Agent want to create a new Ticket.
             *
             * For example, if we create a new Ticket on the "My Tickets" view, we want the new ticket to automatically be
             * assigned to the current user.
             *
             * For that, we need to make sure :
             */
            nextProps.view && // that we have a view from which to extract constraints
            !nextProps.ticket.get('id') && // that we're on a Ticket being created
            !nextProps.ticket.getIn(['state', 'dirty']) && // that this code hasn't been executed yet
            nextProps.tags.get('items').size && nextProps.users.get('agents').size // that we've got all the data needed
        ) {
            const groupedFilters = nextProps.view.get('groupedFilters')

            if (groupedFilters.get('ticket.tags')) {
                const tagNames = groupedFilters.get('ticket.tags').contains
                const newTags = nextProps.tags.get('items').filter(curTag => _.includes(tagNames, curTag.get('name')))
                nextProps.actions.ticket.addTags(newTags)
            }

            if (groupedFilters.get('ticket.status')) {
                nextProps.actions.ticket.setStatus(_.first(groupedFilters.get('ticket.status').eq))
            }

            if (groupedFilters.get('ticket.assignee_user.id')) {
                if (_.first(groupedFilters.get('ticket.assignee_user.id').eq) === '{current_user.id}') {
                    nextProps.actions.ticket.setAgent(nextProps.currentUser)
                } else {
                    nextProps.actions.ticket.setAgent(nextProps.users.get('agents').find(
                        curAgent => curAgent.get('id').toString() === _.first(groupedFilters.get('ticket.assignee_user.id').eq)
                    ))
                }
            } else {
                nextProps.actions.ticket.setAgent(nextProps.currentUser)
            }

            nextProps.actions.ticket.markTicketDirty()
        }
    }

    deleteMessage = (messageId) => {
        this.props.actions.ticket.deleteMessage(this.props.ticket.get('id'), messageId)
    }

    submit = (status, next) => {
        return (e) => {
            e.preventDefault()
            this.props.submit(status || this.props.ticket.get('status'), next)
        }
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

                    <EditableTitle
                        title={ticket.get('subject')}
                        placeholder="Subject"
                        update={actions.ticket.setSubject}
                    />

                    <div className="ui grid">
                        <div className="row">

                            <div className="eight wide column">
                                <TicketTags
                                    tags={tags.get('items').toJS()}
                                    ticketTags={ticket.get('tags')}
                                    addTag={actions.ticket.addTags}
                                    removeTag={actions.ticket.removeTag}
                                    suffix=""
                                />
                            </div>

                            <div className="eight wide column ticket-details">
                                <TicketPriority
                                    priority={ticket.get('priority')}
                                    togglePriority={actions.ticket.togglePriority}
                                />

                                <TicketAssignee
                                    currentAssignee={ticket.getIn(['assignee_user', 'name'])}
                                    agents={users.get('agents')}
                                    setAgent={actions.ticket.setAgent}
                                    suffix=""
                                />

                                <span className="ticket-id ticket-details-item">
                                    {ticketId}
                                </span>

                                <TicketStatus
                                    currentStatus={ticket.get('status')}
                                    setStatus={actions.ticket.setStatus}
                                />

                            </div>

                        </div>
                    </div>

                </div>

                <TicketMessages
                    currentUser={this.props.currentUser}
                    messages={ticket.get('messages')}
                    submit={this.props.submit}
                    deleteMessage={this.deleteMessage}
                    loading={ticket.getIn(['state', 'loading'])}
                    ticket={ticket}
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
                    previewMacroInModal={this.props.actions.macro.previewMacroInModal}
                    openModal={this.props.actions.macro.openModal}
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
    view: PropTypes.object,
    submit: PropTypes.func.isRequired,
    applyMacro: PropTypes.func.isRequired
}
