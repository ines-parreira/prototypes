// @flow
import React from 'react'
import classnames from 'classnames'
import {fromJS} from 'immutable'

import css from './HistoryButton.less'

type Props = {
    isHistoryDisplayed: boolean,
    userHistory: Map<*, *>,
    toggleHistory: () => void,
    usersIsLoading: (T: string) => boolean,
    ticket: Map<*, *>,
}

const HistoryButton = (props: Props) => {
    const {
        isHistoryDisplayed,
        userHistory,
        toggleHistory,
        usersIsLoading,
        ticket,
    } = props

    const ticketHistory = userHistory.get('tickets') || fromJS([])
    const ticketHistoryCount = ticketHistory.filter((t) => t.get('id') !== ticket.get('id')).size

    // $FlowFixMe
    // const eventHistoryCount = userHistory.get('events', fromJS([])).size
    // const itemsCountInHistory = ticketHistoryCount + eventHistoryCount

    const historyTickets = userHistory.get('tickets') || fromJS([])
    const historyOpenedTickets = historyTickets
    // remove current ticket from history for the count
        .filter((t) => t.get('id') !== ticket.get('id'))
        // count only open and new tickets
        .filter((t) => t.get('status') !== 'closed')
    const count = historyOpenedTickets.size > 0 ? historyOpenedTickets.size : ticketHistoryCount

    const buttonDisabled = !ticket.get('id')
        || !userHistory.get('hasHistory')
        || usersIsLoading('history')

    return (
        <button
            className={classnames(css.component, 'btn btn-light btn-circle')}
            disabled={buttonDisabled}
            onClick={toggleHistory}
        >
            {
                isHistoryDisplayed
                    ? (
                        <i className={classnames(css.icon, 'material-icons md-2')}>
                            arrow_upward
                        </i>
                    )
                    : (
                        <span>
                        <i className={classnames(css.icon, css.iconHistory, 'material-icons md-2')}>
                            history
                        </i>
                        <i className={classnames(css.icon, css.iconArrowDown, 'material-icons md-2')}>
                            arrow_downward
                        </i>
                    </span>
                    )
            }

            {
                (count > 0) && (
                    <span className={classnames('badge badge-dot', {
                        'btn-primary': historyOpenedTickets.size > 0,
                        'btn-info': historyOpenedTickets.size === 0,
                    })}>
                        {count}
                    </span>
                )
            }
        </button>
    )
}

export default HistoryButton
