import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import * as mousetrap from 'mousetrap'

import TicketView from '../components/ticket/TicketView'

import * as TicketActions from '../actions/ticket'
import * as MacroActions from '../actions/macro'

class TicketContainer extends React.Component {
    componentWillMount() {
        this.props.actions.ticket.fetchView(
            `/api/tickets/${this.props.params.ticketId}/`,
            {view: this.props.view},
            'item'
        )
        this.props.actions.macro.fetchMacros()
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
    }

    applyMacro = (macro) => {
        this.props.actions.macro.applyMacro(macro, this.props.currentUser)
    }

    componentDidUpdate = (prevProps) => {
        const prevMacros = prevProps.macros.get('items')
        const macros = this.props.macros.get('items')
        if (prevMacros.size === 0 && macros.size !== 0) {
            this.props.actions.macro.previewMacro(macros.valueSeq().first())
        }
    }

    submit = (status) => {
        this.props.actions.ticket.submitTicket(this.props.ticket, status)
    }

    render() {
        if (this.props.ticket.get('messages').size === 0) {
            return null
        }
        return (
            <div className="TicketContainer">
                <TicketView
                    actions={this.props.actions}
                    view={this.props.view}
                    ticket={this.props.ticket}
                    currentUser={this.props.currentUser}
                    update={this.update}
                    submit={this.submit}
                    applyMacro={this.applyMacro}
                    macros={this.props.macros}
                />
            </div>
        )
    }
}

TicketContainer.propTypes = {
    params: PropTypes.shape({
        ticketId: PropTypes.string
    }).isRequired,

    view: PropTypes.string,
    ticket: PropTypes.object,
    macros: PropTypes.object,
    currentUser: PropTypes.object,

    actions: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired
}

TicketContainer.defaultProps = {
    view: 'default'
}

function mapStateToProps(state) {
    return {
        ticket: state.ticket,
        macros: state.macros,
        currentUser: state.currentUser,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            ticket: bindActionCreators(TicketActions, dispatch),
            macro: bindActionCreators(MacroActions, dispatch),
        },
        pushState: bindActionCreators(pushState, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketContainer)
