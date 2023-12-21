import classnames from 'classnames'
import {fromJS, Map, List} from 'immutable'
import React, {Component} from 'react'

import {displayHistoryOnNextPage} from '../../../../state/ticket/actions'

import css from './Timeline.less'
import TimelineTicket from './TimelineTicket'

type Props = {
    displayHistoryOnNextPage?: typeof displayHistoryOnNextPage
    customerHistory: Map<any, any>
    currentTicketId: number
    displayAll: boolean
    revert: boolean
}

export default class Timeline extends Component<Props> {
    static defaultProps: Pick<
        Props,
        'currentTicketId' | 'displayAll' | 'revert'
    > = {
        currentTicketId: 0,
        displayAll: false,
        revert: false,
    }

    render() {
        const {
            currentTicketId,
            customerHistory,
            displayHistoryOnNextPage,
            displayAll,
            revert,
        } = this.props

        if (!customerHistory.get('hasHistory') && !displayAll) {
            return null
        }

        let history = customerHistory.get('tickets', fromJS([])) as List<any>

        if (revert) {
            history = history.reverse() as List<any>
        }

        return (
            <div className={classnames(css.component)}>
                {history
                    .map((obj: Map<any, any>) => {
                        if (obj.get('channel')) {
                            return (
                                <TimelineTicket
                                    displayHistoryOnNextPage={
                                        displayHistoryOnNextPage
                                    }
                                    isCurrent={
                                        currentTicketId === obj.get('id')
                                    }
                                    key={obj.get('id')}
                                    ticket={obj}
                                />
                            )
                        }
                        return null
                    })
                    .toList()}
            </div>
        )
    }
}
