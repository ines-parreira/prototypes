import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import classnames from 'classnames'

import TimelineTicket from './TimelineTicket'

import css from './Timeline.less'

export default class Timeline extends React.Component {
    render() {
        const {customerHistory, revert, displayAll, className} = this.props

        if (!customerHistory.get('hasHistory') && !displayAll) {
            return null
        }

        let history = customerHistory.get('tickets', fromJS([]))

        if (revert) {
            history = history.reverse()
        }

        return (
            <div className={classnames(css.component, className)}>
                {
                    history.map((obj) => {
                        // if it is a ticket
                        if (obj.get('channel')) {
                            return (
                                <TimelineTicket
                                    key={obj.get('id')}
                                    ticket={obj}
                                    isCurrent={this.props.currentTicketId === obj.get('id')}
                                    actions={this.props.actions}
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

Timeline.propTypes = {
    customerHistory: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    currentTicketId: PropTypes.number,
    revert: PropTypes.bool.isRequired,
    displayAll: PropTypes.bool.isRequired,
    className: PropTypes.string,
}

Timeline.defaultProps = {
    customerHistory: fromJS({}),
    actions: {},
    currentTicketId: 0,
    revert: false,
    displayAll: false,
}
