import React, {PropsWithRef} from 'react'
import classNames from 'classnames'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'
import {TicketDetails} from 'hooks/reporting/useDrillDownData'
import TicketIcon from 'pages/common/components/TicketIcon'
import {TicketStatus} from 'business/types/ticket'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import css from './DrillDownTicketDetailsCell.less'

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
            className={classNames(bodyCellProps?.className, {
                [css.highlighted]: !ticketDetails.isRead,
            })}
        >
            <div className={css.channel}>
                {ticketDetails.channel ? (
                    <TicketIcon
                        channel={ticketDetails.channel}
                        isOpen={ticketDetails.status === TicketStatus.Open}
                    />
                ) : (
                    NOT_AVAILABLE_PLACEHOLDER
                )}
            </div>
            <div className={css.wrapper}>
                <h4 className={css.subject}>{ticketDetails.subject}</h4>
                <p className={css.description}>{ticketDetails.description}</p>
            </div>
        </BodyCell>
    )
}
