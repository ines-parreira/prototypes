// @flow
import React from 'react'
import {fromJS} from 'immutable'


type Props = {
    totalClosedTickets: ?number,
    message: ?Object | ?string
}

export default class BlankState extends React.Component<Props> {
    defaultProps = {
        stats: fromJS({})
    }

    render() {
        const {message, totalClosedTickets} = this.props

        const messages = [
            {
                count: 10,
                icon: 'brightness_5',
                title: 'No more tickets here!',
                text: (
                    <div>
                        You closed {totalClosedTickets} tickets this week, that's a good start
                        <span className="ml-2">👌</span>
                    </div>
                )
            },
            {
                count: 100,
                icon: 'check',
                title: 'Done!',
                text: (
                    <div>
                        You've helped {totalClosedTickets} people this week, you deserve some
                        <span className="ml-2">🍪</span>
                    </div>
                )
            },
            {
                count: 500,
                icon: 'flare',
                title: 'All good!',
                text: (
                    <div>
                        You closed {totalClosedTickets} tickets this week, you're awesome
                        <span className="ml-2">🚀</span>
                    </div>
                )
            }
        ]

        // default content
        let content = (
            <div>
                This view is empty. Enjoy your day!
            </div>
        )

        // if custom message, show that.
        if (message) {
            content = message
        } else {
            // match message based on number of closed tickets
            let messageMatch
            messages.reverse().some((presetMessage) => {
                if (totalClosedTickets && totalClosedTickets > presetMessage.count) {
                    messageMatch = presetMessage
                    return true
                }
                return false
            })
            if (messageMatch) {
                content = (
                    <div className="blank-state-message">
                        <i className="blank-state-message-icon material-icons">
                            {messageMatch.icon}
                        </i>
                        <h2 className="blank-state-message-title">
                            {messageMatch.title}
                        </h2>
                        <div className="blank-state-message-text">
                            {messageMatch.text}
                        </div>
                    </div>
                )
            }
        }

        return (
            <div className="blank-state">
                {content}
            </div>
        )
    }
}
