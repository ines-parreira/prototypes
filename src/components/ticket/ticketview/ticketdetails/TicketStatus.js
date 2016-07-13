import React, {PropTypes} from 'react'
import { TICKET_STATUSES } from './../../../../constants'

export default class TicketStatus extends React.Component {
    componentDidMount() {
        $(this.refs.popupStatus).popup({
            inline: true,
            position: this.props.position || 'bottom right',
            hoverable: true,
            on: 'click'
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
    }

    render() {
        const { setStatus, currentStatus } = this.props
        return (
            <div className="ticket-status-wrapper">
                <button type="button" className="g-label ticket-status-action" onClick={() => this.setQuickStatus(currentStatus)}>
                    {currentStatus === 'closed' ? 'OPEN' : 'CLOSE'}
                </button>

                <button type="button" className="g-label ticket-status-dropdown" ref="popupStatus">
                    <i className="caret down icon"></i>
                </button>

                <div className="ui popup">
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
            </div>
        )
    }
}

TicketStatus.propTypes = {
    setStatus: PropTypes.func.isRequired,
    currentStatus: PropTypes.string.isRequired,
    position: PropTypes.string
}
