import React, {PropTypes} from 'react'
import TimelineTicket from './TimelineTicket'


export default class Timeline extends React.Component {
    render() {
        const {userHistory, isDisplayed} = this.props

        if (!userHistory.get('hasHistory') || !isDisplayed) {
            return null
        }

        const tickets = userHistory.get('tickets')
        const events = userHistory.get('events')

        const history = tickets.concat(events).sort(
            (obj1, obj2) => obj1.get('created_datetime') > obj2.get('created_datetime')
        )

        if (history.size === 1) {
            return null
        }

        return (
            <div className="Timeline">
                <div className="body">
                    {
                        history.map(obj => {
                            if (obj.get('channel')) {
                                // Then it's a ticket
                                return (
                                    <TimelineTicket
                                        key={obj.get('id')}
                                        ticket={obj}
                                        current={this.props.currentTicketId === obj.get('id')}
                                        actions={this.props.actions}
                                    />
                                )
                            }

                            return <div key={obj.get('id')}>{obj.get('id')}</div>
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
    currentTicketId: PropTypes.number
}
