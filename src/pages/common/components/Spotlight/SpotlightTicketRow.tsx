import React, {ComponentProps, useMemo} from 'react'
import moment from 'moment'
import {fromJS} from 'immutable'

import {Customer} from 'models/customer/types'
import {Ticket, TicketAssignee} from 'models/ticket/types'
import TicketIcon from 'pages/common/components/TicketIcon'
import {UserAssigneeLabel} from 'pages/common/utils/labels'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'
import {formatDatetime} from 'utils'
import SpotlightRow from './SpotlightRow'
import css from './SpotlightTicketRow.less'

export const pickedTicketFields = [
    'id',
    'channel',
    'status',
    'subject',
    'excerpt',
    'assignee_user',
    'created_datetime',
] as const

export type PickedTicket = Pick<Ticket, typeof pickedTicketFields[number]> & {
    customer: Pick<Customer, 'id' | 'name' | 'email'>
}

type SpotlightTicketRowProps = {
    item: Ticket | PickedTicket
    onCloseModal: () => void
    id: number
    index: number
    onHover?: ComponentProps<typeof SpotlightRow>['onHover']
    selected?: boolean
    onClick: () => void
}

const SpotlightTicketRow = ({
    item,
    onCloseModal,
    id,
    index,
    onHover,
    selected,
    onClick,
}: SpotlightTicketRowProps) => (
    <SpotlightRow
        id={id}
        index={index}
        icon={<TicketIcon channel={item.channel} status={item.status} />}
        title={item.subject || item.excerpt || ''}
        info={
            <SpotlightTicketInfo
                customerName={item.customer!.name}
                customerEmail={item.customer!.email}
                customerId={item.customer!.id}
                assignee={item.assignee_user}
                date={item.created_datetime}
            />
        }
        link={`/app/ticket/${item.id}`}
        onCloseModal={onCloseModal}
        onHover={onHover}
        selected={selected}
        onClick={onClick}
    />
)

const SpotlightTicketInfo = ({
    customerName,
    customerEmail,
    customerId,
    assignee,
    date,
}: {
    customerName: string | null
    customerEmail: string | null
    customerId: number
    assignee?: TicketAssignee | null
    date: string
}) => {
    const datetimeFormatShort = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithOrdinalSuffixDay
    )
    const datetimeFormatShortWithYear = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithYearAndOrdinalSuffixDay
    )

    const formattedDate = useMemo(() => {
        const isToday = moment(date).isSame(moment(), 'day')
        const isThisYear = moment(date).isSame(moment(), 'year')

        return isToday
            ? 'Today'
            : formatDatetime(
                  date,
                  isThisYear ? datetimeFormatShort : datetimeFormatShortWithYear
              )
    }, [date, datetimeFormatShort, datetimeFormatShortWithYear])

    return (
        <div className={css.ticketInfo}>
            <span>
                {customerName || customerEmail || `Customer #${customerId}`}
            </span>
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
