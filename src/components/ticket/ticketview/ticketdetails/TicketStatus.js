import React, {PropTypes} from 'react'
import { TICKET_STATUSES } from './../../../../constants'
import {browserHistory} from 'react-router'

export default class TicketStatus extends React.Component {
    componentDidMount() {
        $(this.refs.popupStatus).popup({
            inline: true,
            position: this.props.position || 'bottom right',
            hoverable: true,
            on: 'click',
            popup: '.ticket-status-popup'
        })
    }

    componentDidUpdate() {
        // when the status changes, hide the popup
        $(this.refs.popupStatus).popup('hide')
    }

    setQuickStatus(status) {
        let newStatus = 'closed'
        if (status === 'closed') {
            newStatus = 'open'
        }

        this.props.setStatus(newStatus)

        // when closing the ticket, jump to the next one
        if (newStatus === 'closed') {
            const nextUrl = this.props.computeNextUrl(true)

            if (nextUrl) {
                // redirect to the next ticket after a while.
                // time also needed for the notification to stay up,
                // otherwise the redirect will hide it.
                setTimeout(() => {
                    browserHistory.push(nextUrl)
                }, 500)
            }
        }
    }

    render() {
        const { setStatus, currentStatus } = this.props

        return (
            <div className="ticket-status-wrapper ui buttons">
                <button type="button" className="ticket-status-action ui basic grey button" onClick={() => this.setQuickStatus(currentStatus)}>
                    {currentStatus === 'closed' ? 'OPEN' : 'CLOSE'}
                </button>

                <div className="ui popup ticket-status-popup">
                    <div
                        className="ui vertical menu"
                        style={{ textAlign: 'left', border: 'none', width: 'inherit' }}
                    >

                    {TICKET_STATUSES.map((status) =>
                        <button
                            className={`item ticket-status ticket-details-item ui ${status} label`}
                            key={status}
                            onClick={() => setStatus(status)}
                        >
                            {status}
                        </button>
                    )}

                    </div>
                </div>

                <button className="ticket-status-dropdown ui basic grey floating dropdown icon button" ref="popupStatus">
                    <i className="dropdown icon"></i>
                </button>
            </div>
        )
    }
}

TicketStatus.propTypes = {
    setStatus: PropTypes.func.isRequired,
    computeNextUrl: PropTypes.func.isRequired,
    currentStatus: PropTypes.string.isRequired,
    position: PropTypes.string
}
