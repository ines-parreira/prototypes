import React, {PropTypes} from 'react'

import Tooltip from '../../../../common/components/Tooltip'

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
                <i id="ticket-header-trash-icon"
                   className="icon material-icons md-2 text-danger">
                    delete
                </i>
                <Tooltip
                    placement="top"
                    target="ticket-header-trash-icon"
                >
                    Deleted
                </Tooltip>
            </div>
        )
    }
}
