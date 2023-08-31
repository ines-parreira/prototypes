import React from 'react'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'

import css from './HistoryButton.less'

type Props = {
    isHistoryDisplayed: boolean
    customerHistory: Map<any, any>
    toggleHistory: () => void
    customersIsLoading: (T: string) => boolean
    ticket: Map<any, any>
}

const HistoryButton = (props: Props) => {
    const {
        isHistoryDisplayed,
        customerHistory,
        toggleHistory,
        customersIsLoading,
        ticket,
    } = props

    const ticketHistory = (customerHistory.get('tickets') ||
        fromJS([])) as List<any>
    const ticketHistoryCount = ticketHistory.filter(
        (t: Map<any, any>) => t.get('id') !== ticket.get('id')
    ).size

    const historyTickets = (customerHistory.get('tickets') ||
        fromJS([])) as List<any>
    const historyOpenedTickets = historyTickets
        // remove current ticket from history for the count
        .filter((t: Map<any, any>) => t.get('id') !== ticket.get('id'))
        // count only open and new tickets
        .filter((t: Map<any, any>) => t.get('status') !== 'closed')
    const count =
        historyOpenedTickets.size > 0
            ? historyOpenedTickets.size
            : ticketHistoryCount

    const buttonDisabled =
        !ticket.get('id') ||
        !customerHistory.get('hasHistory') ||
        customersIsLoading('history')

    return (
        <button
            className={classnames(css.component, 'btn btn-light btn-circle')}
            disabled={buttonDisabled}
            onClick={toggleHistory}
        >
            {isHistoryDisplayed ? (
                <i className={classnames(css.icon, 'material-icons md-2')}>
                    arrow_upward
                </i>
            ) : (
                <span>
                    <i
                        className={classnames(
                            css.icon,
                            css.iconHistory,
                            'material-icons md-2'
                        )}
                    >
                        history
                    </i>
                    <i
                        className={classnames(
                            css.icon,
                            css.iconArrowDown,
                            'material-icons md-2'
                        )}
                    >
                        arrow_downward
                    </i>
                </span>
            )}

            {count > 0 && (
                <span
                    className={classnames('badge badge-dot', {
                        'btn-primary': historyOpenedTickets.size > 0,
                        'btn-info': historyOpenedTickets.size === 0,
                    })}
                >
                    {count}
                </span>
            )}
        </button>
    )
}

export default HistoryButton
