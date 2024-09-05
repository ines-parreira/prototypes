import React, {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getBusinessHoursSettings} from 'state/currentAccount/selectors'

import {CampaignScheduleTypeValueEnum} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'
import {DateTimeFormatType, DateTimeFormatMapper} from 'constants/datetime'
import {formatDatetime, Datetime} from 'utils'

import {SCHEDULE_RULE_LABELS} from './constants'

import css from './CampaignScheduleSummary.less'

type Props = {
    scheduleConfiguration: Record<string, any>
}

type TemplateMessageProps = {
    startDate: Datetime
    endDate: Datetime | null
    label?: string
    timezone?: string
}

const defaultMessageTemplate = ({
    startDate,
    endDate,
    label,
    timezone,
}: TemplateMessageProps) => {
    return (
        <>
            Your campaign will run from <strong>{startDate}</strong>,{' '}
            {endDate && (
                <>
                    to <strong>{endDate}</strong>,
                </>
            )}{' '}
            <strong>{label}</strong>, {timezone} time.
        </>
    )
}

const customMessageTemplate = ({
    startDate,
    endDate,
    timezone,
}: TemplateMessageProps) => {
    return (
        <>
            Your campaign will run continuously from{' '}
            <strong>{startDate}</strong>{' '}
            {endDate ? (
                <>
                    <strong>to {endDate}</strong>
                </>
            ) : (
                ''
            )}
            , during the set days and hours above, {timezone} time.
        </>
    )
}

const CampaignScheduleSummary: React.FC<Props> = ({scheduleConfiguration}) => {
    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)
    const timezone = businessHoursSettings?.data?.timezone
    const dateLabel =
        DateTimeFormatMapper[
            DateTimeFormatType.LONG_DATE_WITH_DAY_OF_WEEK_WITH_YEAR_EN_GB
        ]

    const formattedStartDate = useMemo(() => {
        return formatDatetime(scheduleConfiguration.startDate, dateLabel)
    }, [scheduleConfiguration.startDate, dateLabel])

    const formattedEndDate = useMemo(() => {
        if (!scheduleConfiguration.endDate) {
            return null
        }
        return formatDatetime(scheduleConfiguration.endDate, dateLabel)
    }, [scheduleConfiguration.endDate, dateLabel])
    let message

    if (scheduleConfiguration.schedule_type in SCHEDULE_RULE_LABELS) {
        message = defaultMessageTemplate({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            label: SCHEDULE_RULE_LABELS[
                scheduleConfiguration.schedule_type as string
            ],
            timezone,
        })
    }

    // Custom
    if (
        scheduleConfiguration.schedule_type ===
        CampaignScheduleTypeValueEnum.Custom
    ) {
        message = customMessageTemplate({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            timezone,
        })
    }

    return <div className={css.messageWrapper}>{message}</div>
}

export default CampaignScheduleSummary
