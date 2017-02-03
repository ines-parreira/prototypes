import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import TicketMessage from './TicketMessage'
import CustomerRating from './CustomerRating'


export default class TicketMessages extends React.Component {
    shouldComponentUpdate(nextProps) {
        return !nextProps.messages.equals(this.props.messages)
            || !nextProps.ticket.getIn(['_internal', 'loading'])
                .equals(this.props.ticket.getIn(['_internal', 'loading']))
    }

    render() {
        const {messages, ticket} = this.props
        if (messages.size === 0) {
            return null
        }
        // We concatenate messages and customer ratings.
        // Ratings have a 'rating_datetime' which is equivalent to created_datetime.
        const allMessages = messages.concat(ticket.get('customer_ratings')
            .map((cr) => cr.set('isCustomerRating', true).set('created_datetime', cr.get('rating_datetime'))))
            .sortBy((m) => m.get('created_datetime'))
        return (
            <div className="TicketMessages">
                {allMessages.map((message, index) => {
                    if (message.get('isCustomerRating')) {
                        return (
                            <CustomerRating
                                key={`${index.toString()}_rating`}
                                rating={message}
                                currentUser={this.props.currentUser}
                            />
                        )
                    }

                    return (
                        <TicketMessage
                            key={message.get('id')}
                            message={message.toJS()}
                            deleteMessage={this.props.deleteMessage}
                            loading={
                                !!this.props.loadingState.get('updateMessage', fromJS([]))
                                .find(msgId => msgId === message.get('id'))
                            }
                            ticket={this.props.ticket}
                            currentUser={this.props.currentUser}
                        />
                    )
                }
                )}
            </div>
        )
    }
}

TicketMessages.propTypes = {
    deleteMessage: PropTypes.func.isRequired,
    messages: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    loadingState: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired
}
