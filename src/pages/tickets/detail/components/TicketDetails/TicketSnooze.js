// @flow
import React, {Component} from 'react'

import Tooltip from '../../../../common/components/Tooltip'
import {formatDatetime} from '../../../../../utils'

type Props = {
    className: ?string,
    datetime: ?string
}

export default class TicketSnooze extends Component<Props> {
    render() {
        const {datetime} = this.props

        if (!datetime) {
            return null
        }

        return (
            <div className={this.props.className}>
                <i id="ticket-header-snooze-icon"
                    className="icon material-icons">
                    snooze
                </i>
                <Tooltip
                    placement="bottom"
                    target="ticket-header-snooze-icon"
                >
                    Snooze {formatDatetime(datetime)}
                </Tooltip>
            </div>
        )
    }
}
