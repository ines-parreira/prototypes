import React from 'react'

import Tooltip from '../../../../common/components/Tooltip'

type Props = {
    className: ?string,
    spam: ?boolean
}

export default class TicketSpam extends React.Component<Props> {
    static defaultProps = {
        className: null,
        spam: false
    }

    render() {
        if (!this.props.spam) {
            return null
        }

        return (
            <div className={this.props.className}>
                <i id="ticket-header-spam-icon"
                    className="icon material-icons text-danger">
                    flag
                </i>
                <Tooltip
                    placement="bottom"
                    target="ticket-header-spam-icon"
                >
                    Marked as spam
                </Tooltip>
            </div>
        )
    }
}
