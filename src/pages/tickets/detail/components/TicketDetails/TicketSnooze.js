// @flow
import React, {Component} from 'react'

import Tooltip from '../../../../common/components/Tooltip'
import {formatDatetime} from '../../../../../utils'

type Props = {
    datetime: ?string
}

export default class TicketSnooze extends Component<Props> {
    render() {
        const {datetime} = this.props

        if (!datetime) {
            return null
        }

        return (
            <div className="d-inline-block mr-3">
                <i id="ticket-header-snooze-icon"
                    className="icon material-icons md-2">
                    snooze
                </i>
                <Tooltip
                    placement="top"
                    target="ticket-header-snooze-icon"
                >
                    Snooze {formatDatetime(datetime)}
                </Tooltip>
            </div>
        )
    }
}
