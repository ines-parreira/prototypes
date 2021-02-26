import classnames from 'classnames'
import {fromJS, Map, List} from 'immutable'
import React from 'react'

import {displayHistoryOnNextPage} from '../../../../state/ticket/actions'

import css from './Timeline.less'
import TimelineTicket from './TimelineTicket'

type Props = {
    actions?: Maybe<{
        displayHistoryOnNextPage?: typeof displayHistoryOnNextPage
    }>
    customerHistory: Map<any, any>
    currentTicketId: number
    displayAll: boolean
    revert: boolean
}

export default class Timeline extends React.Component<Props> {
    static defaultProps = {
        actions: {},
        currentTicketId: 0,
        displayAll: false,
        revert: false,
    }

    render() {
        const {
            actions,
            currentTicketId,
            customerHistory,
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
                                    actions={actions}
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
