import React, {PropTypes} from 'react'
import {TICKET_STATUSES} from '../../../../../config'

export default class TicketStatus extends React.Component {
    componentDidMount() {
        $(this.refs.popupStatus).popup({
            inline: true,
            position: this.props.position,
            hoverable: true,
            on: 'click',
            popup: '.ticket-status-popup'
        })
    }

    componentDidUpdate() {
        // when the status changes, hide the popup
        $(this.refs.popupStatus).popup('hide')
    }

    render() {
        const {setStatus, setQuickStatus, currentStatus} = this.props

        return (
            <div className="ticket-status-wrapper ui buttons">
                <button
                    type="button"
                    className="ticket-status-action ui basic grey button"
                    onClick={() => {
                        if (setQuickStatus) {
                            setQuickStatus(currentStatus)
                        }
                    }}
                >
                    {currentStatus === 'closed' ? 'OPEN' : 'CLOSE'}
                </button>

                <div className="ui popup ticket-status-popup">
                    <div
                        className="ui vertical menu"
                        style={{textAlign: 'left', border: 'none', width: 'inherit'}}
                    >

                        {
                            TICKET_STATUSES.map((status) =>
                                <button
                                    type="button"
                                    className={`item ticket-status ticket-details-item ui ${status} label`}
                                    key={status}
                                    onClick={() => {
                                        setStatus(status)
                                    }}
                                >
                                    {status}
                                </button>
                            )
                        }

                    </div>
                </div>

                <button
                    className="ticket-status-dropdown ui basic grey floating dropdown icon button"
                    ref="popupStatus"
                    type="button"
                >
                    <i className="dropdown icon" />
                </button>
            </div>
        )
    }
}

TicketStatus.propTypes = {
    setStatus: PropTypes.func.isRequired,
    setQuickStatus: PropTypes.func,
    currentStatus: PropTypes.string.isRequired,
    position: PropTypes.string
}

TicketStatus.defaultProps = {
    position: 'bottom right'
}
