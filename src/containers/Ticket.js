import React, { PropTypes } from 'react'
import { browserHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as mousetrap from 'mousetrap'

import TicketView from '../components/ticket/ticketview/TicketView'

import * as TicketActions from '../actions/ticket'
import * as MacroActions from '../actions/macro'
import * as UserActions from '../actions/user'
import * as TagActions from '../actions/tag' // import that to fetch tags list

class TicketContainer extends React.Component {
    componentWillMount() {
        this.props.actions.ticket.fetchTicketDetails(this.props.params.ticketId)
        this.props.actions.macro.fetchMacros()
        this.props.actions.tag.fetchTags()
    }

    componentDidMount() {
        // Have to bind these here so they capture at the correct level
        const macrosVisible = () => this.props.macros.get('visible')

        mousetrap.bind('escape', () => {
            if (macrosVisible()) {
                this.props.actions.macro.setMacrosVisible(false)
            }
        })
        mousetrap.bind('return', () => {
            if (macrosVisible()) {
                this.applyMacro(this.props.macros.get('selected'))
            }
        })
        mousetrap.bind('up', () => {
            if (macrosVisible()) {
                this.props.actions.macro.previewAdjacentMacro('prev')
            }
        })
        mousetrap.bind('down', () => {
            if (macrosVisible()) {
                this.props.actions.macro.previewAdjacentMacro('next')
            }
        })
        mousetrap.bind('left', () => {
            const nextUrl = this.computeNextUrl(false)

            if (nextUrl) {
                browserHistory.push(nextUrl)
            }
        })
        mousetrap.bind('right', () => {
            const nextUrl = this.computeNextUrl(true)

            if (nextUrl) {
                browserHistory.push(nextUrl)
            }
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.ticketId !== this.props.params.ticketId) {
            this.props.actions.ticket.fetchTicketDetails(nextProps.params.ticketId)
            this.props.actions.macro.fetchMacros()
            this.props.actions.tag.fetchTags()
        }
    }

    componentDidUpdate = (prevProps) => {
        const prevMacros = prevProps.macros.get('items')
        const macros = this.props.macros.get('items')
        if (prevMacros.size === 0 && macros.size !== 0) {
            this.props.actions.macro.previewMacro(macros.valueSeq().first())
        }
    }

    applyMacro = (macro) => {
        this.props.actions.macro.applyMacro(macro, this.props.currentUser)
    }

    computeNextUrl(ascending) {
        const translation = ascending ? 1 : -1
        const nextTicket = this.props.tickets.get('items').toJS()[
            this.props.tickets.get('currentTicketIndex') + translation
        ]

        let nextTicketUrl = null

        if (nextTicket) {
            nextTicketUrl = `/app/ticket/${nextTicket.id}`
            this.props.actions.ticket.saveIndex(this.props.tickets.get('currentTicketIndex') + translation)
        }

        return nextTicketUrl
    }

    toggleSubjectEditMode = () => {
        const subjectObject = $('#ticket-subject')

        subjectObject.addClass('segment edit-mode').attr('contentEditable', true).focus().bind('keypress', (e) => {
            if (e.keyCode === 13) { e.preventDefault() }
        }).bind('keyup', (e) => {
            if (e.keyCode === 13 || e.keyCode === 27) {
                e.preventDefault()
                subjectObject.unbind('keypress').removeClass('segment edit-mode').attr('contentEditable', false)
                const subject = subjectObject.text()

                if (subject && e.keyCode === 13) {
                    this.props.actions.ticket.setSubject(subject)
                } else {
                    subjectObject.text(this.props.ticket.get('subject'))
                }
            }
        })
    }

    submit = (status, next = false) => {
        this.props.actions.ticket.submitTicket(this.props.ticket, status)

        if (next) {
            /**
             * `next` is a boolean indicating whether the agent want to be redirected to the next ticket.
             *
             * If he does, we first try to get the naive next ticket (the ticket at the current index + 1).
             * If the ticket doesnt exist, then we can't redirect the agent.
             * If it does, we save the new index (the old index + 1) as the new current index, then we push
             * the new state to the application.
             */
            const nextTicketUrl = this.computeNextUrl(true)
            browserHistory.push(nextTicketUrl)
        }
    }

    render() {
        if (this.props.ticket.get('messages').size === 0) {
            return null
        }
        return (
            <div className="TicketContainer" onKeyDown={this.handleKeyDown}>
                <TicketView
                    actions={this.props.actions}
                    ticket={this.props.ticket}
                    tags={this.props.tags}
                    users={this.props.users}
                    currentUser={this.props.currentUser}
                    update={this.update}
                    submit={this.submit}
                    applyMacro={this.applyMacro}
                    macros={this.props.macros}
                    toggleSubject={this.toggleSubjectEditMode}
                />
            </div>
        )
    }
}

TicketContainer.propTypes = {
    params: PropTypes.shape({
        view: PropTypes.string,
        page: PropTypes.string,
        ticketId: PropTypes.string
    }).isRequired,

    view: PropTypes.string,
    ticket: PropTypes.object,
    tickets: PropTypes.object,
    macros: PropTypes.object,
    tags: PropTypes.object,
    users: PropTypes.object,
    currentUser: PropTypes.object,
    settings: PropTypes.object,

    actions: PropTypes.object.isRequired
}

TicketContainer.defaultProps = {
    view: 'default'
}

function mapStateToProps(state) {
    return {
        ticket: state.ticket,
        tickets: state.tickets,
        macros: state.macros,
        tags: state.tags,
        users: state.users,
        currentUser: state.currentUser,
        settings: state.settings
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            ticket: bindActionCreators(TicketActions, dispatch),
            macro: bindActionCreators(MacroActions, dispatch),
            tag: bindActionCreators(TagActions, dispatch),
            user: bindActionCreators(UserActions, dispatch)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketContainer)
