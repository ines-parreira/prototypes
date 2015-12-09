import React, {PropTypes} from 'react'

import TicketMessage from './TicketMessage'

export default class TicketMessages extends React.Component {
    render() {
        const {messages} = this.props
        if (!messages) {
            return null
        }
        return (
            <div className="TicketMessages">
                <div className="ui divided items">
                    {messages.map((message) => {
                        if (!message.id) {
                            return null
                        }

                        return (
                            <TicketMessage key={message.id}
                                           message={message}
                                           currentUser={this.props.currentUser} />
                        )
                    })}
                </div>
            </div>
        )
    }
}

TicketMessages.propTypes = {
    messages: PropTypes.array,
    currentUser: PropTypes.object
}
