import React, {PropTypes} from 'react'
import classnames from 'classnames'


export default class TicketPriority extends React.Component {
    render() {
        const { priority, togglePriority } = this.props
        return (
            <a
                className="ticket-flag-btn ticket-details-item"
                onClick={togglePriority}
            >
                <i
                    className={classnames(
                        'ticket-priority',
                        priority === 'high' ? '' : 'outline',
                        'action',
                        'icon',
                        'flag'
                    )}
                />
            </a>
        )
    }
}


TicketPriority.propTypes = {
    priority: PropTypes.string.isRequired,
    togglePriority: PropTypes.func.isRequired
}
