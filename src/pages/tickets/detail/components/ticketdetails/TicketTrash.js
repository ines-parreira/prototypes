import React, {PropTypes} from 'react'
import {UncontrolledTooltip} from 'reactstrap'

export default class TicketTrash extends React.Component {
    static propTypes = {
        trashed: PropTypes.bool,
    }

    static defaultProps = {
        trashed: false
    }

    render() {
        if (!this.props.trashed) {
            return null
        }

        return (
            <div className="d-inline-block mr-3">
                <i
                    id="ticket-header-trash-icon"
                    className="fa fa-trash text-danger"
                />
                <UncontrolledTooltip
                    placement="top"
                    target="ticket-header-trash-icon"
                    delay={0}
                >
                    Deleted
                </UncontrolledTooltip>
            </div>
        )
    }
}
