import React from 'react'

import Tooltip from '../../../../common/components/Tooltip'

type Props = {
    className: ?string,
    trashed: ?boolean,
}

export default class TicketTrash extends React.Component<Props> {
    static defaultProps = {
        className: null,
        trashed: false,
    }

    render() {
        if (!this.props.trashed) {
            return null
        }

        return (
            <div className={this.props.className}>
                <i
                    id="ticket-header-trash-icon"
                    className="icon material-icons text-danger"
                >
                    delete
                </i>
                <Tooltip placement="bottom" target="ticket-header-trash-icon">
                    Deleted
                </Tooltip>
            </div>
        )
    }
}
