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
                        return (
                            <TicketMessage key={message.id} message={message}/>
                        )
                    })}
                </div>
            </div>
        )
    }
}

TicketMessages.propTypes = {
    messages: PropTypes.array
}
