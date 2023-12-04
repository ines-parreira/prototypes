import React, {PropsWithRef} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'
import {TicketDetails} from 'hooks/reporting/useDrillDownData'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import {ChannelLabel} from 'pages/common/utils/labels'
import css from './DrillDownTicketDetailsCell.less'

export const DrillDownTicketDetailsCell = ({
    ticketDetails,
    bodyCellProps,
}: {
    ticketDetails: TicketDetails
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
                    {ticketDetails.channel ? (
                        <ChannelLabel channel={ticketDetails.channel} />
                    ) : (
                        NOT_AVAILABLE_PLACEHOLDER
                    )}
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
