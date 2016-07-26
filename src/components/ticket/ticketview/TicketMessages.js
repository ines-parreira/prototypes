import React, {PropTypes} from 'react'
import TicketMessage from './TicketMessage'
import CustomerRating from './CustomerRating'


export default class TicketMessages extends React.Component {
    shouldComponentUpdate(nextProps) {
        return !nextProps.messages.equals(this.props.messages)
    }

    render() {
        const {messages, ticket} = this.props
        if (messages.size === 0) {
            return null
        }
        const allMessages = messages.concat(ticket.get('customer_ratings')
            .map((cr) => cr.set('isCustomerRating', true)))
            .sortBy((m) => m.get('created_datetime'))
        return (
            <div className="TicketMessages">
                {allMessages.map((message, index) => {
                    if (message.get('isCustomerRating')) {
                        return (<CustomerRating key={`${index.toString()}_rating`}
                                                rating={message}
                                                currentUser={this.props.currentUser}
                        />)
                    }

                    return (<TicketMessage
                            key={message.get('id')}
                            message={message.toJS()}
                            currentUser={this.props.currentUser}
                            submit={this.props.submit}
                            deleteMessage={this.props.deleteMessage}
                            loading={this.props.loading}
                            ticket={this.props.ticket}
                    />)
                }
                )}
            </div>
        )
    }
}

TicketMessages.propTypes = {
    submit: PropTypes.func.isRequired,
    deleteMessage: PropTypes.func.isRequired,
    messages: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    ticket: PropTypes.object.isRequired
}
