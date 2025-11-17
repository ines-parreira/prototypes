import React, { useMemo } from 'react'

import { fromJS } from 'immutable'
import moment from 'moment'

import { DateAndTimeFormatting } from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { EntityType } from 'hooks/useSearchRankScenario'
import type { PickedTicketWithHighlights } from 'models/search/types'
import type { TicketAssignee } from 'models/ticket/types'
import { ticketHighlightsTransform } from 'pages/common/components/Spotlight/helpers'
import SpotlightRow from 'pages/common/components/Spotlight/SpotlightRow'
import css from 'pages/common/components/Spotlight/SpotlightTicketRow.less'
import TicketIcon from 'pages/common/components/TicketIcon'
import { UserAssigneeLabel } from 'pages/common/utils/labels'
import { formatDatetime } from 'utils'
import { sanitizeHtmlDefault } from 'utils/html'

type SpotlightTicketRowProps = {
    item: PickedTicketWithHighlights
    onCloseModal: () => void
    id: number
    index: number
    selected?: boolean
    onClick: () => void
}

const SpotlightTicketRow = ({
    item,
    onCloseModal,
    id,
    index,
    selected,
    onClick,
}: SpotlightTicketRowProps) => {
    const itemWithHighlights = useMemo(
        () => ticketHighlightsTransform(item),
        [item],
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
            selected={selected}
            onClick={onClick}
            message={itemWithHighlights.message}
            entityType={EntityType.Ticket}
            entityId={itemWithHighlights.ticketId}
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
        DateAndTimeFormatting.ShortDateWithOrdinalSuffixDay,
    )
    const datetimeFormatShortWithYear = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithYearAndOrdinalSuffixDay,
    )

    const formattedDate = useMemo(() => {
        const isToday = moment(date).isSame(moment(), 'day')
        const isThisYear = moment(date).isSame(moment(), 'year')

        return isToday
            ? 'Today'
            : formatDatetime(
                  date,
                  isThisYear
                      ? datetimeFormatShort
                      : datetimeFormatShortWithYear,
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
