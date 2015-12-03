import React, {PropTypes} from 'react'

import Search from '../Search'
import TicketReply from './TicketReply'
import TicketMessages from './TicketMessages'

export default class TicketView extends React.Component {
    render() {
        const {ticket} = this.props
        const messages = ticket.get('messages', null)

        return (
            <div className="TicketView">
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

                    <div className="right menu">
                        <div className="item">
                            <Search />
                        </div>
                    </div>
                </div>
                <h1 className="ui header">{ticket.get('subject')}</h1>
                <div className="ui basic segment header-meta">
                    <div className="ui left floated header">
                        <div className="ui tiny labels">
                            <div className="ui red label">REFUND <i className="icon close"/></div>
                            <div className="ui teal label">PAYMENT <i className="icon close"/></div>
                            <a href="">+ Add tag</a>
                        </div>
                    </div>
                    <div className="ui right floated header">
                        <div className="misc">
                            <span className="ticket-id">Ticket #{ticket.get('id')}</span>
                            <span className={`ui ticket-status ${ticket.get('status')} label`}>
                                {ticket.get('status')}
                            </span>
                        </div>
                    </div>
                    <div className="ui clearing divider"></div>
                </div>
                <TicketMessages messages={messages} />
                <TicketReply ticket={ticket} send={this.props.send}/>
            </div>
        )
    }
}

TicketView.propTypes = {
    ticket: PropTypes.object.isRequired,
    send: PropTypes.func.isRequired,
    pushState: PropTypes.func
}
