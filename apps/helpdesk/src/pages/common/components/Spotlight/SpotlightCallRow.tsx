import { useMemo } from 'react'

import moment from 'moment'

import { VoiceCallDirection } from '@gorgias/helpdesk-queries'

import { TicketStatus } from 'business/types/ticket'
import { DateAndTimeFormatting } from 'constants/datetime'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import { EntityType } from 'hooks/useSearchRankScenario'
import { PicketVoiceCallWithHighlights } from 'models/search/types'
import {
    getInboundDisplayStatus,
    getOutboundDisplayStatus,
} from 'models/voiceCall/types'
import { callHighlightsTransform } from 'pages/common/components/Spotlight/helpers'
import SpotlightRow from 'pages/common/components/Spotlight/SpotlightRow'
import TicketIcon from 'pages/common/components/TicketIcon'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import { formatDatetime } from 'utils'

import VoiceCallStatusLabel from '../VoiceCallStatusLabel/VoiceCallStatusLabel'

import css from './SpotlightCallRow.less'

type SpotlightCallRowProps = {
    item: PicketVoiceCallWithHighlights
    onCloseModal: () => void
    id: number
    index: number
    selected?: boolean
    onClick: () => void
}

const SpotlightCallRow = ({
    item,
    onCloseModal,
    id,
    index,
    selected,
    onClick,
}: SpotlightCallRowProps) => {
    const itemWithHighlights = useMemo(
        () => callHighlightsTransform(item),
        [item],
    )

    return (
        <SpotlightRow
            id={id}
            index={index}
            icon={<TicketIcon channel={'phone'} status={TicketStatus.Open} />}
            title={`${itemWithHighlights.phone_number_source} called ${itemWithHighlights.phone_number_destination}`}
            info={<SpotlightCallInfo voiceCall={item} />}
            link={`/app/ticket/${item.ticket_id}?call_id=${item.id}`}
            onCloseModal={onCloseModal}
            selected={selected}
            onClick={onClick}
            entityType={EntityType.Call}
            message={itemWithHighlights.highlightedText}
        />
    )
}

const SpotlightCallInfo = ({
    voiceCall,
}: {
    voiceCall: PicketVoiceCallWithHighlights
}) => {
    const datetimeFormatShort = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithOrdinalSuffixDay,
    )
    const datetimeFormatShortWithYear = useGetDateAndTimeFormat(
        DateAndTimeFormatting.ShortDateWithYearAndOrdinalSuffixDay,
    )

    const formattedDate = useMemo(() => {
        const isToday = moment(voiceCall.created_datetime).isSame(
            moment(),
            'day',
        )
        const isThisYear = moment(voiceCall.created_datetime).isSame(
            moment(),
            'year',
        )

        return isToday
            ? 'Today'
            : formatDatetime(
                  voiceCall.created_datetime,
                  isThisYear
                      ? datetimeFormatShort
                      : datetimeFormatShortWithYear,
              )
    }, [voiceCall, datetimeFormatShort, datetimeFormatShortWithYear])

    return (
        <div>
            <div className={css.callInfo}>
                <VoiceCallCustomerLabel
                    customerId={voiceCall.customer_id}
                    phoneNumber={
                        voiceCall.direction === 'inbound'
                            ? voiceCall.phone_number_source
                            : voiceCall.phone_number_destination
                    }
                    className={css.customerLabel}
                />
                <span className={css.separator} />
                <VoiceCallStatusLabel
                    displayStatus={
                        voiceCall.direction === VoiceCallDirection.Inbound
                            ? getInboundDisplayStatus(
                                  voiceCall.status,
                                  voiceCall.termination_status,
                                  voiceCall.last_answered_by_agent_id,
                                  voiceCall.status_in_queue,
                              )
                            : getOutboundDisplayStatus(voiceCall.status)
                    }
                />
                <span className={css.separator} />
                <span>{formattedDate}</span>
            </div>
        </div>
    )
}

export default SpotlightCallRow
