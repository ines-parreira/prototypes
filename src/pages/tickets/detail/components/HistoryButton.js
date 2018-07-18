// @flow
import React from 'react'
import classnames from 'classnames'
import {fromJS} from 'immutable'

import css from './HistoryButton.less'

type Props = {
    isHistoryDisplayed: boolean,
    customerHistory: Map<*, *>,
    toggleHistory: () => void,
    customersIsLoading: (T: string) => boolean,
    ticket: Map<*, *>,
}

const HistoryButton = (props: Props) => {
    const {
        isHistoryDisplayed,
        customerHistory,
        toggleHistory,
        customersIsLoading,
        ticket,
    } = props

    const ticketHistory = customerHistory.get('tickets') || fromJS([])
    const ticketHistoryCount = ticketHistory.filter((t) => t.get('id') !== ticket.get('id')).size

    // $FlowFixMe
    // const eventHistoryCount = customerHistory.get('events', fromJS([])).size
    // const itemsCountInHistory = ticketHistoryCount + eventHistoryCount

    const historyTickets = customerHistory.get('tickets') || fromJS([])
    const historyOpenedTickets = historyTickets
    // remove current ticket from history for the count
        .filter((t) => t.get('id') !== ticket.get('id'))
        // count only open and new tickets
        .filter((t) => t.get('status') !== 'closed')
    const count = historyOpenedTickets.size > 0 ? historyOpenedTickets.size : ticketHistoryCount

    const buttonDisabled = !ticket.get('id')
        || !customerHistory.get('hasHistory')
        || customersIsLoading('history')

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
