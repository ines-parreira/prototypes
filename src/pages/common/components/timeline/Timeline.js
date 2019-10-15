// @flow
import classnames from 'classnames'
import { fromJS, type Map } from 'immutable'
import React from 'react'

import css from './Timeline.less'
import TimelineTicket from './TimelineTicket'

type Props = {
    actions: {},
    customerHistory: Map<*,*>,
    currentTicketId: number,
    displayAll: boolean,
    revert: boolean,
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

        let history = customerHistory.get('tickets', fromJS([]))

        if (revert) {
            history = history.reverse()
        }

        return (
            <div className={classnames(css.component)}>
                {
                    history.map((obj) => {
                        const isTicket = obj.get('channel')
                        if (isTicket) {
                            return (
                                <TimelineTicket
                                    actions={actions}
                                    isCurrent={currentTicketId === obj.get('id')}
                                    key={obj.get('id')}
                                    ticket={obj}
                                />
                            )
                        }
                        return null
                    }).toList()
                }
            </div>
        )
    }
}
