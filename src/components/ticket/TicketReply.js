import React, {PropTypes} from 'react'
import moment from 'moment'

export default class TicketReply extends React.Component {
    onChange = (ev) => {
        return this.props.actions.ticket.setResponseText(
            this.props.currentUser, ev.target.value
        )
    }

    render() {
        const {currentUser} = this.props

        return (
            <div className="TicketReply search ui raised segment">
                <div className="ui left floated header sender">
                    <span className="name">
                        <span className="ui mini yellow author-label label">A</span> {currentUser.get('name')}
                    </span>
                    <div className="sub header email">{currentUser.get('email')}</div>
                </div>
                <form className="ui reply form">
                    <div className="field">
                        <textarea
                            value={this.props.value}
                            onChange={this.onChange}
                        />
                    </div>
                </form>
            </div>
        )
    }
}

TicketReply.propTypes = {
    actions: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    value: PropTypes.string.isRequired,
}
