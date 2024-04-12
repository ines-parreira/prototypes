import React, {ComponentProps, useMemo} from 'react'
import moment from 'moment'
import {fromJS} from 'immutable'
import {TicketHighlights} from 'models/search/types'
import {Customer} from 'models/customer/types'

import {Ticket, TicketAssignee} from 'models/ticket/types'
import TicketIcon from 'pages/common/components/TicketIcon'
import {UserAssigneeLabel} from 'pages/common/utils/labels'

import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'
import {formatDatetime} from 'utils'
import {sanitizeHtmlDefault} from 'utils/html'
import {ticketHighlightsTransform} from 'pages/common/components/Spotlight/helpers'
import SpotlightRow from 'pages/common/components/Spotlight/SpotlightRow'
import css from 'pages/common/components/Spotlight/SpotlightTicketRow.less'

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
    item: PickedTicket
    onCloseModal: () => void
    id: number
    index: number
    onHover?: ComponentProps<typeof SpotlightRow>['onHover']
    selected?: boolean
    onClick: () => void
    highlights?: TicketHighlights
}

const SpotlightTicketRow = ({
    item,
    onCloseModal,
    id,
    index,
    onHover,
    selected,
    onClick,
    highlights,
}: SpotlightTicketRowProps) => {
    const itemWithHighlights = useMemo(
        () => ticketHighlightsTransform(item, highlights),
        [item, highlights]
    )

    return (
        <SpotlightRow
            id={id}
            index={index}
            icon={
                <TicketIcon
                    channel={itemWithHighlights.channel}
                    status={itemWithHighlights.status}
                />
            }
            title={itemWithHighlights.title}
            info={
                <SpotlightTicketInfo
                    customer={itemWithHighlights.customer}
                    assignee={itemWithHighlights.assignee_user}
                    date={itemWithHighlights.created_datetime}
                />
            }
            link={`/app/ticket/${itemWithHighlights.id}`}
            onCloseModal={onCloseModal}
            onHover={onHover}
            selected={selected}
            onClick={onClick}
            message={itemWithHighlights.message}
        />
    )
}

const SpotlightTicketInfo = ({
    customer,
    assignee,
    date,
}: {
    customer: string
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
        <div>
            <div className={css.ticketInfo}>
                <span
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtmlDefault(customer),
                    }}
                />
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
        </div>
    )
}

export default SpotlightTicketRow
