import React, { PropsWithRef } from 'react'

import classnames from 'classnames'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import TicketIcon, { NullTicketIcon } from 'pages/common/components/TicketIcon'
import { TicketDetails } from 'pages/stats/common/drill-down/DrillDownFormatters'
import css from 'pages/stats/common/drill-down/DrillDownTicketDetailsCell.less'
import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'

const TICKET_DELETED_OR_MERGED = 'Ticket has been deleted or merged'
const TICKET_LABEL = 'Ticket'

export const DrillDownTicketDetailsCell = ({
    ticketDetails,
    bodyCellProps,
}: {
    ticketDetails: TicketDetails
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) => {
    return (
        <BodyCell
            {...bodyCellProps}
            className={classnames(bodyCellProps?.className, {
                [css.highlighted]:
                    !ticketDetails.isRead && ticketDetails.status !== null,
            })}
        >
            <div className={css.channel}>
                {ticketDetails.status === null ? (
                    <NullTicketIcon />
                ) : ticketDetails.channel ? (
                    <TicketIcon
                        channel={ticketDetails.channel}
                        status={ticketDetails.status}
                    />
                ) : (
                    NOT_AVAILABLE_PLACEHOLDER
                )}
            </div>
            <div className={css.wrapper}>
                <h4 className={css.subject}>
                    {ticketDetails.subject ??
                        `${TICKET_LABEL} ${ticketDetails.id}`}
                </h4>
                <p className={css.description}>
                    {ticketDetails.description ?? TICKET_DELETED_OR_MERGED}
                </p>
            </div>
        </BodyCell>
    )
}
