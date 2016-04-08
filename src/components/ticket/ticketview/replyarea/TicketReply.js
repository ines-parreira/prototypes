import React, { PropTypes } from 'react'

export default class TicketReply extends React.Component {
    onChange = (ev) => {
        return this.props.actions.ticket.setResponseText(
            this.props.currentUser, ev.target.value
        )
    }

    render() {
        return (
            <div className="TicketReply search ui raised segment">
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
