import React, {useMemo} from 'react'
import moment from 'moment'
import {fromJS} from 'immutable'
import classnames from 'classnames'

import {Ticket, TicketAssignee} from 'models/ticket/types'
import SourceIcon from 'pages/common/components/SourceIcon'
import Tooltip from 'pages/common/components/Tooltip'
import {UserAssigneeLabel} from 'pages/common/utils/labels'
import {TicketChannel, TicketStatus} from 'business/types/ticket'
import useId from 'hooks/useId'

import SpotlightRow from './SpotlightRow'
import css from './SpotlightTicketRow.less'

const SpotlightTicketRow = ({
    item,
    onCloseModal,
}: {
    item: Ticket
    onCloseModal: () => void
}) => (
    <SpotlightRow
        icon={
            <SpotlightTicketIcon
                channel={item.channel}
                isOpen={item.status === TicketStatus.Open}
            />
        }
        title={item.subject || item.excerpt || ''}
        info={
            <SpotlightTicketInfo
                customerName={item.customer.name}
                customerId={item.customer.id}
                assignee={item.assignee_user}
                date={item.created_datetime}
            />
        }
        link={`/app/ticket/${item.id}`}
        onCloseModal={onCloseModal}
    />
)

const SpotlightTicketIcon = ({
    channel,
    isOpen = false,
}: {
    channel: TicketChannel
    isOpen?: boolean
}) => {
    const id = useId()
    const iconTargetId = 'icon-' + id + '-tooltip-target'
    return (
        <div
            className={classnames(css.ticketIconWrapper, {
                [css.isOpen]: isOpen,
            })}
            id={iconTargetId}
        >
            <SourceIcon type={channel} className={css.ticketIcon} />
            <Tooltip placement="top" target={iconTargetId}>
                This ticket is {isOpen ? 'open' : 'closed'}
            </Tooltip>
        </div>
    )
}

const SpotlightTicketInfo = ({
    customerName,
    customerId,
    assignee,
    date,
}: {
    customerName: string | null
    customerId: number
    assignee?: TicketAssignee | null
    date: string
}) => {
    const formattedDate = useMemo(() => {
        const isToday = moment(date).isSame(moment(), 'day')
        const isThisYear = moment(date).isSame(moment(), 'year')

        return isToday
            ? 'Today'
            : moment(date).format(isThisYear ? 'MMM Do' : 'MMM Do YY')
    }, [date])

    return (
        <div className={css.ticketInfo}>
            <span>{customerName || `Customer #${customerId}`}</span>
            {!!assignee && (
                <>
                    <span className={css.infoSeparator}>•</span>
                    <UserAssigneeLabel
                        assigneeUser={fromJS(assignee)}
                        size={24}
                    />
                </>
            )}
            <span className={css.separator} />
            <span>{formattedDate}</span>
        </div>
    )
}

export default SpotlightTicketRow
