import React, {PropsWithRef} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import {ChannelLabel} from 'pages/common/utils/labels'
import {TicketMessageSourceType} from 'business/types/ticket'
import css from './DrillDownTicketDetailsCell.less'

export const DrillDownTicketDetailsCell = ({
    ticketDetails,
    bodyCellProps,
}: {
    ticketDetails: {
        id: number
        subject: string
        description: string
        channel: TicketMessageSourceType
        isRead: boolean
    }
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) => {
    return (
        <BodyCell {...bodyCellProps}>
            <Link
                role="link"
                to={`/app/ticket/${ticketDetails.id}`}
                target="_blank"
                className={classNames(css.container, {
                    [css.highlighted]: !ticketDetails.isRead,
                })}
            >
                <div className={css.channel}>
                    <ChannelLabel channel={ticketDetails.channel} />
                </div>
                <div className={css.wrapper}>
                    <h4 className={css.subject}>{ticketDetails.subject}</h4>
                    <p className={css.description}>
                        {ticketDetails.description}
                    </p>
                </div>
            </Link>
        </BodyCell>
    )
}
