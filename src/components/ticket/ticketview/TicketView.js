import React, { PropTypes } from 'react'

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
            /**
             * In the future, this should use the filters_ast to generically apply any filter to the message.
             * Though, not sure it is worth it right now.
             */

            const filtersAst = nextProps.view.get('filters_ast')
            const exp = filtersAst.getIn(['body', 0, 'expression']).toJS()

            const fields = {}
            const walk = function (node) {
                switch (node.type) {
                    case 'LogicalExpression':
                        if (node.operator !== '&&') {
                            throw Error('Unknown operator', node)
                        }
                        walk(node.left)
                        walk(node.right)

                        break
                    case 'CallExpression':
                        if (['eq', 'contains'].indexOf(node.callee.name) === -1) {
                            break
                        }

                        const left = walk(node.arguments[0])
                        const right = walk(node.arguments[1])
                        if (!Array.isArray(fields[left])) {
                            fields[left] = []
                        }
                        fields[left].push(right)
                        break
                    case 'MemberExpression':
                        return `${walk(node.object)}.${node.property.name}`
                    case 'Literal':
                        // raw comes with extra quotes - we should remove them
                        return node.raw.replace(/^"/, '').replace(/"$/, '')
                    case 'Identifier':
                        return node.name
                    default:
                        throw Error('Unknown node type', node)

                }
            }

            walk(exp)

            // Since it's the agent clicking on the 'New Ticket' it's automatically assigned to them
            nextProps.actions.ticket.setAgent(nextProps.currentUser)
            for (const field of Object.keys(fields)) {
                const values = fields[field]
                const firstValue = values[0]

                switch (field) {
                    case 'ticket.tags.name':
                        const newTags = nextProps.tags.get('items').filter(t => values.indexOf(t.get('name')) !== -1)
                        nextProps.actions.ticket.addTags(newTags)
                        break
                    case 'ticket.status':
                        nextProps.actions.ticket.setStatus(firstValue)
                        break
                    case 'ticket.assignee_user.id':
                        if (firstValue !== '{current_user.id}') {
                            nextProps.actions.ticket.setAgent(nextProps.users.get('agents').find(
                                curAgent => curAgent.get('id').toString() === firstValue
                            ))
                        }
                        break
                    case 'ticket.priority':
                        nextProps.actions.ticket.setPriority(firstValue)
                        break
                    default:
                        break
                }
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
            this.props.submit(status, next)
        }
    }

    render = () => {
        const {ticket, tags, users, actions} = this.props

        let ticketId = ''

        if (ticket.get('id')) {
            ticketId = `#${ticket.get('id')}`
        }

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
                        focus={!ticket.get('id')}
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
