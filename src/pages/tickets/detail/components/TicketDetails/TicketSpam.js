import React from 'react'
import PropTypes from 'prop-types'

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
                <i id="ticket-header-spam-icon"
                    className="icon material-icons md-2 text-danger">
                    flag
                </i>
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
