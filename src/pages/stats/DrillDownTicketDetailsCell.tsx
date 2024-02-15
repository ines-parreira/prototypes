import classnames from 'classnames'
import React, {PropsWithRef} from 'react'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'

import {TicketDetails} from 'hooks/reporting/useDrillDownData'
import TicketIcon, {NullTicketIcon} from 'pages/common/components/TicketIcon'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/DrillDownTicketDetailsCell.less'

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
