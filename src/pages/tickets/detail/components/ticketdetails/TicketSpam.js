import React, {PropTypes} from 'react'

import Tooltip from '../../../../common/components/Tooltip'

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
                    className="fa fa-lg fa-flag text-danger"
                />
                <Tooltip
                    placement="top"
                    target="ticket-header-spam-icon"
                >
                    Marked as spam
                </Tooltip>
            </div>
        )
    }
}
