import type { PropsWithRef } from 'react'
import React from 'react'

import classnames from 'classnames'

import type { TicketDetails } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import css from 'domains/reporting/pages/common/drill-down/DrillDownTicketDetailsCell.less'
import type { Props as BodyCellProps } from 'pages/common/components/table/cells/BodyCell'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

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
            <div className={css.wrapper}>
                <h4 className={css.subject}>
                    {ticketDetails.subject ??
                        `${TICKET_LABEL} ${ticketDetails.id}`}
                </h4>
                <p className={css.description}>
                    {ticketDetails.description ?? ''}
                </p>
            </div>
        </BodyCell>
    )
}
