import React, {PropTypes} from 'react'

import TicketMessages from './TicketMessages'
import TicketReplyArea from './TicketReplyArea'
import TicketSubmitButtons from './TicketSubmitButtons'
import TicketTags from './TicketTags'

export default class TicketView extends React.Component {
    componentDidMount() {
        $('.ui.dropdown', this.refs.ticketView).dropdown({
            on: 'hover',
            action: 'nothing'
        })
    }

    submit = (status) => {
        return (e) => {
            e.preventDefault()
            this.props.submit(status || this.props.ticket.get('status'))
        }
    }

    render = () => {
        const { ticket } = this.props

        return (
            <div className="ticket-view" ref="ticketView">
                <div className="ticket-header">
                    <div className="ticket-actions-btn ui dropdown">
                        <i className="ui icon angle down"></i>
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
                                <TicketTags tags={ticket.get('tags')} />
                            </div>
                            <div className="eight wide column ticket-details">
                                <a className="ticket-flag-btn ticket-details-item">
                                    <i className="icon flag" />
                                </a>

                                <a className="ticket-owner-btn ticket-details-item">
                                    <span className="ui yellow label">A</span>
                                    ABHIMANYU SINGH
                                </a>

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
    pushState: PropTypes.func
}
