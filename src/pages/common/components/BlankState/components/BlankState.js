// @flow
import React, {type Node} from 'react'

import emptyTicketList from '../../../../../../img/empty-ticket-list.svg'

type Props = {
    totalClosedTickets: ?number,
    message: ?Object | ?string
}

type Message = {
    title: string,
    text: Node
}

const defaultMessage: Message = {
    title: 'This view is empty.',
    text: 'Enjoy your day!'
}

const BlankState = ({message, totalClosedTickets}: Props) => {
    const closedTicketsNumber = totalClosedTickets || 0
    const presetMessages: Array<Message & { count: number }> = [{
        count: 10,
        title: 'No more tickets here!',
        text: (
            <div>
                You closed {totalClosedTickets} tickets this week, that's a good start
                <span className="ml-2" role="img" aria-label="ok emoji">👌</span>
            </div>
        )
    }, {
        count: 100,
        title: 'Done!',
        text: (
            <div>
                You've helped {totalClosedTickets} people this week, you deserve some
                <span className="ml-2" role="img" aria-label="cookie emoji">🍪</span>
            </div>
        )
    }, {
        count: 500,
        title: 'All good!',
        text: (
            <div>
                You closed {totalClosedTickets} tickets this week, you're awesome
                <span className="ml-2" role="img" aria-label="rocket emoji">🚀</span>
            </div>
        )
    }]

    const content = (() => {
        if (message) {
            return message
        }
        const presetMessage = presetMessages.reverse()
            .find((message) => {
                return closedTicketsNumber > message.count
            })
        const {title, text} = presetMessage || defaultMessage
        return (
            <div className="blank-state-message">
                <img
                    className="blank-state-message-icon"
                    src={emptyTicketList}
                    alt="Empty ticket list"
                />
                <h2 className="blank-state-message-title">
                    {title}
                </h2>
                <div className="blank-state-message-text">
                    {text}
                </div>
            </div>
        )
    })()

    return (
        <div className="blank-state">
            {content}
        </div>
    )
}

export default BlankState
