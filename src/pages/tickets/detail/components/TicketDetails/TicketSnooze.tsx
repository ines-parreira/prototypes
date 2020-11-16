import React from 'react'

import Tooltip from '../../../../common/components/Tooltip.js'
import {formatDatetime} from '../../../../../utils'

type Props = {
    className?: string
    datetime?: string
    timezone: string
}

const TicketSnooze = ({className, datetime, timezone}: Props) =>
    datetime ? (
        <div className={className}>
            <i id="ticket-header-snooze-icon" className="icon material-icons">
                snooze
            </i>
            <Tooltip placement="bottom" target="ticket-header-snooze-icon">
                Snooze {formatDatetime(datetime, timezone)}
            </Tooltip>
        </div>
    ) : null

export default TicketSnooze
