import React, { PropTypes } from 'react'

import TicketMessage from './TicketMessage'

export default class TicketMessages extends React.Component {
    render() {
        const { messages } = this.props
        if (messages.size === 0) {
            return null
        }
        return (
            <div className="TicketMessages">
                {messages.map((message) => (
                    <TicketMessage
                        key={message.get('id')}
                        message={message.toJS()}
                        currentUser={this.props.currentUser}
                        submit={this.props.submit}
                        deleteMessage={this.props.deleteMessage}
                        loading={this.props.loading}
                        ticket={this.props.ticket}
                    />
                ))}
            </div>
        )
    }
}

TicketMessages.propTypes = {
    submit: PropTypes.func.isRequired,
    deleteMessage: PropTypes.func.isRequired,
    messages: PropTypes.object,
    currentUser: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    ticket: PropTypes.object
}
