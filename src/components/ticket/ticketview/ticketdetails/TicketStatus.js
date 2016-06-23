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

    render() {
        const { setStatus, currentStatus } = this.props
        return (
            <div className="ticket-status-wrapper">
                <a
                    ref="popupStatus"
                    className={`ticket-status ticket-details-item ui ${currentStatus} label`}
                >
                    {currentStatus}
                </a>

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
