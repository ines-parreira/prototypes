import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {Emoji} from '../../Emoji'

export const BlankState = ({message, stats}) => {
    // total closed tickets in the last 7 days
    const closedTickets = stats.getIn(['agents', 0, 1])

    const messages = [
        {
            count: 10,
            icon: 'sun',
            title: 'No more tickets here!',
            text: (
                <div>
                    You closed {closedTickets} tickets this week, that's a good start
                    <Emoji name="ok_hand" />
                </div>
            )
        },
        {
            count: 100,
            icon: 'check circle',
            title: 'Done!',
            text: (
                <div>
                    You've helped {closedTickets} people this week, you deserve some
                    <Emoji name="cookie" />
                </div>
            )
        },
        {
            count: 500,
            icon: 'asterisk',
            title: 'All good!',
            text: (
                <div>
                    You closed {closedTickets} tickets this week, you're awesome
                    <Emoji name="rocket" />
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
        messages.reverse().some(msg => {
            if (closedTickets > msg.count) {
                messageMatch = msg
                return true
            }
        })

        if (messageMatch) {
            const iconClassName = classnames(
                'blank-state-message-icon',
                'icon',
                messageMatch.icon
            )

            content = (
                <div className="blank-state-message">
                    <i className={iconClassName} />
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

BlankState.propTypes = {
    stats: PropTypes.object,

    message: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
}

BlankState.defaultProps = {
    stats: fromJS({})
}
