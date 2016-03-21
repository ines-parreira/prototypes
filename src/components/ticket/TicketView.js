import React, {PropTypes} from 'react'

import TicketReply from './TicketReply'
import TicketMessages from './TicketMessages'

export default class TicketView extends React.Component {
    render() {
        const {ticket} = this.props
        const messages = ticket.get('messages', null)

        return (
            <div className="TicketView">
                <div className="TicketHeader">
                    <div className="ui text menu">
                        <a className="item">
                            <i className="clock icon"/> Previous tickets
                        </a>
                        <a className="item">
                            <i className="user icon"/>
                            Assigned to Avi
                        </a>
                        <a className="item">
                            <i className="outline flag icon"/>
                            Mark as important
                        </a>
                    </div>
                    <h1 className="ui header">{ticket.get('subject')}</h1>
                    <div className="ui grid">
                        <div className="row">
                            <div className="left floated eight wide column">
                                <div className="ui tiny labels">
                                    <div className="ticket-tag ui red horizontal label">REFUND <i
                                        className="icon close"/></div>
                                    <div className="ticket-tag ui teal horizontal label">PAYMENT <i
                                        className="icon close"/></div>
                                    <a href="">+ Add tag</a>
                                </div>
                            </div>
                            <div className="right floated eight wide column">
                                <div className="misc">
                                    <span className="ticket-id">Ticket #{ticket.get('id')}</span>
                                    <span className={`ui ticket-status horizontal ${ticket.get('status')} label`}>
                                        {ticket.get('status')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="ui clearing divider"></div>
                    </div>
                </div>
                <TicketMessages
                    currentUser={this.props.currentUser}
                    messages={messages}/>
                <TicketReply
                    ticket={ticket}
                    currentUser={this.props.currentUser}
                    update={this.props.update}
                    submit={this.props.submit}/>
            </div>
        )
    }
}

TicketView.propTypes = {
    ticket: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    update: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    pushState: PropTypes.func
}
