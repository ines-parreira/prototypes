import React, {PropTypes} from 'react'
import {StickyContainer, Sticky} from 'react-sticky'
import classNames from 'classnames'
import {fromJS} from 'immutable'

import TicketHeader from './TicketHeader'

import TicketMessages from './TicketMessages'

import ReplyMessageChannel from './replyarea/ReplyMessageChannel'
import TicketReplyArea from './replyarea/TicketReplyArea'
import TicketSubmitButtons from './replyarea/TicketSubmitButtons'

export default class TicketView extends React.Component {
    // USED ONLY BY THE COMMENTED DROPDOWN BELOW
    // componentDidMount() {
    //     $('#top-option-dropdown').dropdown({
    //         on: 'hover',
    //         action: 'nothing'
    //     })
    // }
    constructor() {
        super()
        this.state = {
            isTicketHidden: false
        }
    }

    componentWillMount() {
        const shouldDisplayHistoryOnNextPage = this.props.ticket.getIn(['_internal', 'shouldDisplayHistoryOnNextPage'])
        const displayHistory = this.props.ticket.getIn(['_internal', 'displayHistory'])

        if (shouldDisplayHistoryOnNextPage !== displayHistory) {
            this.props.actions.ticket.toggleHistory(shouldDisplayHistoryOnNextPage)
        }

        if (shouldDisplayHistoryOnNextPage) {
            this.props.actions.ticket.displayHistoryOnNextPage(false)
        }
    }

    componentDidMount() {
        /**
         * The code below is used to initialize a new Ticket being created with the constraints of the view
         * on which the Agent want to create a new Ticket.
         *
         * For example, if we create a new Ticket on the "My Tickets" view, we want the new ticket to automatically be
         * assigned to the current user.
         *
         * For that, we need to make sure :
         */
        const shouldInitializeForm = this.props.view && !this.props.view.isEmpty() &&
            // that we're on a Ticket being created
            !this.props.ticket.get('id') &&
            // that this code hasn't been executed yet
            !this.props.ticket.getIn(['state', 'dirty']) &&
            // that we've got all the data needed
            this.props.tags.get('items').size && this.props.users.get('agents').size

        if (shouldInitializeForm) {
            const filtersAst = this.props.view.get('filters_ast')

            const exp = filtersAst.getIn(['body', 0, 'expression'])

            const fields = {}
            const walk = (node) => {
                switch (node.type) {
                    case 'LogicalExpression':
                        if (node.operator !== '&&') {
                            throw Error('Unknown operator', node)
                        }
                        walk(node.left)
                        walk(node.right)

                        break
                    case 'CallExpression': {
                        if (!~['eq', 'contains'].indexOf(node.callee.name)) {
                            break
                        }

                        const left = walk(node.arguments[0])
                        const right = walk(node.arguments[1])
                        if (!Array.isArray(fields[left])) {
                            fields[left] = []
                        }
                        fields[left].push(right)
                        break
                    }
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
                return null
            }

            // exp can be undefined if our AST is empty.
            if (exp) {
                walk(exp.toJS())
            }

            // Since it's the agent clicking on the 'New Ticket' it's automatically assigned to them
            this.props.actions.ticket.setAgent(this.props.currentUser)
            for (const field of Object.keys(fields)) {
                const values = fields[field]
                const firstValue = values[0]

                switch (field) {
                    case 'ticket.tags.name': {
                        const newTags = this.props.tags.get('items').filter(t => ~values.indexOf(t.get('name')))
                        this.props.actions.ticket.addTags(newTags)
                        break
                    }
                    case 'ticket.status':
                        this.props.actions.ticket.setStatus(firstValue)
                        break
                    case 'ticket.assignee_user.id':
                        if (firstValue !== '{current_user.id}') {
                            this.props.actions.ticket.setAgent(this.props.users.get('agents').find(
                                curAgent => curAgent.get('id').toString() === firstValue
                            ))
                        }
                        break
                    case 'ticket.priority':
                        this.props.actions.ticket.setPriority(firstValue)
                        break
                    default:
                        break
                }
            }

            this.props.actions.ticket.markTicketDirty()
        }
    }

    deleteMessage = (messageId) => {
        this.props.actions.ticket.deleteMessage(this.props.ticket.get('id'), messageId)
    }

    hideTicket = () => {
        this.setState({
            isTicketHidden: true
        })
    }

    _handlePreSubmit = (...args) => {
        if (this.refs.newMessageForm.checkValidity()) {
            this.statusParams = args
        } else {
            this.statusParams = []
        }
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        this.props.submit.apply(this, this.statusParams)
    }

    _renderMessages = (isCreating = false) => {
        const {ticket} = this.props

        if (!isCreating) {
            return (
                <TicketMessages
                    currentUser={this.props.currentUser}
                    messages={ticket.get('messages')}
                    submit={this.props.submit}
                    deleteMessage={this.deleteMessage}
                    loading={ticket.getIn(['_internal', 'loading', 'submitMessage'])}
                    ticket={ticket}
                />
            )
        }
    }

    render = () => {
        const {ticket, tags, users, actions, computeNextUrl, hidden} = this.props

        const isCreating = !ticket.get('id')

        // for testing,
        // get hidden from props.
        const isTicketHidden = hidden || this.state.isTicketHidden

        const itemsCountInHistory = users.getIn(['userHistory', 'tickets'], fromJS([])).size
            + users.getIn(['userHistory', 'events'], fromJS([])).size

        const historyButtonLabel = !ticket.getIn(['_internal', 'displayHistory'])
            ? <p><i className="icon arrow circle up" />Show user history ({itemsCountInHistory})</p>
            : 'Hide user history'

        return (
            <div className={classNames('ticket-view', {
                'transition out fade right': isTicketHidden
            })}>
                <StickyContainer>
                    <Sticky
                        topOffset={1}
                        style={{transform: 'none'}}
                    >
                        <div className="previous-btn-container">
                            <button
                                className={classNames(
                                    'ticket-previous-btn ui small button',
                                    {
                                        transparent: !ticket.get('id')
                                        || !users.getIn(['userHistory', 'hasHistory'])
                                        || ticket.getIn(['_internal', 'displayHistory'])
                                        || users.getIn(['_internal', 'loading', 'history'])
                                    }
                                )}
                                onClick={() => {
                                    const shouldOpenHistory =
                                        ticket.get('id')
                                        && users.getIn(['userHistory', 'hasHistory'])
                                        && !ticket.getIn(['_internal', 'displayHistory'])

                                    if (shouldOpenHistory) {
                                        actions.ticket.toggleHistory(true)
                                        document.getElementsByClassName('TicketDetailContainer')[0].scrollTop = 0

                                        amplitude.getInstance().logEvent('Opened Timeline', {
                                            nbOfTicketsInTimeline: users.getIn(['userHistory', 'tickets']).size,
                                            channel: ticket.get('channel'),
                                            nbOfMessagesInTicket: ticket.get('messages').size
                                        })
                                    }
                                }}
                            >
                                {historyButtonLabel}
                            </button>
                        </div>
                        <TicketHeader
                            ticket={ticket}
                            tags={tags}
                            agents={users.get('agents')}
                            actions={actions}
                            computeNextUrl={computeNextUrl}
                            hideTicket={this.hideTicket}
                        />
                    </Sticky>

                    <div className="ticket-content">

                        {this._renderMessages(isCreating)}

                        <form
                            onSubmit={this._handleSubmit}
                            ref="newMessageForm"
                        >
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
                                submit={this._handlePreSubmit}
                            />
                        </form>
                    </div>
                </StickyContainer>
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
    applyMacro: PropTypes.func.isRequired,
    computeNextUrl: PropTypes.func.isRequired,
    hidden: PropTypes.bool
}
