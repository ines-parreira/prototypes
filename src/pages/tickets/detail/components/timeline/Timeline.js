import React, {PropTypes} from 'react'
import TimelineTicket from './TimelineTicket'


export default class Timeline extends React.Component {
    render() {
        const {userHistory, isDisplayed} = this.props

        if (!userHistory.get('hasHistory') || !isDisplayed) {
            return null
        }

        const history = userHistory.get('tickets')

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
