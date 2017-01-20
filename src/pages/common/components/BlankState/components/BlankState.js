import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {fromJS} from 'immutable'
import {emoji} from '../../../../../utils'

export const BlankState = ({message, stats}) => {
    // return empty if still loading stats,
    // to avoid jumpyness.
    if (stats.getIn(['_internal', 'loading', 'stats'])) {
        return null
    }

    // total closed tickets in the last 7 days
    const closedTickets = stats.getIn(['agents', 0, 1])

    const messages = [
        {
            count: 10,
            icon: 'sun',
            title: 'No more tickets here!',
            text: `You closed ${closedTickets} tickets this week, that's a good start 👌`
        },
        {
            count: 100,
            icon: 'check circle',
            title: 'Done!',
            text: `You've helped ${closedTickets} people this week, you deserve some 🍪`
        },
        {
            count: 500,
            icon: 'asterisk',
            title: 'All good!',
            text: `You closed ${closedTickets} tickets this week, you're awesome 🚀`
        }
    ]

    // default content
    let content = <p>This view is empty. Enjoy your day!</p>

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
                    <i className={iconClassName}/>
                    <h2 className="blank-state-message-title">
                        {messageMatch.title}
                    </h2>
                    <p className="blank-state-message-text"
                       dangerouslySetInnerHTML={{__html: emoji(messageMatch.text)}}
                    />
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
