import React, {PropTypes} from 'react'
import {UncontrolledTooltip} from 'reactstrap'

export default class TicketSpam extends React.Component {
    static propTypes = {
        spam: PropTypes.bool,
    }

    static defaultProps = {
        spam: false
    }

    render() {
        if (!this.props.spam) {
            return null
        }

        return (
            <div className="d-inline-block mr-3">
                <i
                    id="ticket-header-spam-icon"
                    className="fa fa-flag text-danger"
                />
                <UncontrolledTooltip
                    placement="top"
                    target="ticket-header-spam-icon"
                    delay={0}
                >
                    Marked as spam
                </UncontrolledTooltip>
            </div>
        )
    }
}
