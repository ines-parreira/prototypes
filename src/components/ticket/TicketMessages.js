import React, {PropTypes} from 'react'

import TicketMessage from './TicketMessage'

export default class TicketMessages extends React.Component {
    render() {
        const {messages} = this.props
        if (messages.size === 0) {
            return null
        }
        return (
            <div className="TicketMessages">
                <div className="ui divided items">
                    {messages.map((message) => {
                        return (
                            <TicketMessage key={message.get('id')}
                                message={message.toJS()}
                                currentUser={this.props.currentUser}
                                />
                        )
                    })}
                </div>
            </div>
        )
    }
}

TicketMessages.propTypes = {
    messages: PropTypes.object,
    currentUser: PropTypes.object,
}
