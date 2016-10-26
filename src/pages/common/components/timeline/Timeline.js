import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import TimelineTicket from './TimelineTicket'

export default class Timeline extends React.Component {
    render() {
        const {userHistory, isDisplayed, revert, displayAll} = this.props

        if (!isDisplayed) {
            return null
        }

        if (!userHistory.get('hasHistory') && !displayAll) {
            return null
        }

        let history = userHistory.get('tickets', fromJS([]))

        if (revert) {
            history = history.reverse()
        }

        return (
            <div className="Timeline">
                <div className="body">
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

                            // otherwise it is an event
                            return (
                                <div key={obj.get('id')}>
                                    {obj.get('id')}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

Timeline.propTypes = {
    userHistory: PropTypes.object.isRequired,
    isDisplayed: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    currentTicketId: PropTypes.number,
    revert: PropTypes.bool.isRequired,
    displayAll: PropTypes.bool.isRequired,
}

Timeline.defaultProps = {
    isDisplayed: false,
    actions: {},
    currentTicketId: 0,
    revert: false,
    displayAll: false,
}
