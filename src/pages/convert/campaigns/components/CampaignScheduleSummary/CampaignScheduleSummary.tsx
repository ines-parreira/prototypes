import React, {useMemo} from 'react'

import {DateTimeFormatType, DateTimeFormatMapper} from 'constants/datetime'
import useAppSelector from 'hooks/useAppSelector'
import {ScheduleSchema} from 'pages/convert/campaigns/types/CampaignSchedule'
import {CampaignScheduleRuleValueEnum} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'
import {getBusinessHoursSettings} from 'state/currentAccount/selectors'
import {formatDatetime, Datetime} from 'utils'

import css from './CampaignScheduleSummary.less'
import {SCHEDULE_RULE_LABELS} from './constants'

type Props = {
    scheduleConfiguration: ScheduleSchema
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
            Your campaign will run from <strong>{startDate}</strong>
            {endDate ? (
                <>
                    {' '}
                    to <strong>{endDate}</strong>,
                </>
            ) : (
                ','
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
            <strong>{startDate}</strong>
            {endDate ? (
                <>
                    {' '}
                    to <strong>{endDate}</strong>,
                </>
            ) : (
                ','
            )}{' '}
            during the set days and hours above, {timezone} time.
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
        return formatDatetime(
            scheduleConfiguration.start_datetime,
            dateLabel,
            timezone
        )
    }, [scheduleConfiguration.start_datetime, dateLabel, timezone])

    const formattedEndDate = useMemo(() => {
        if (!scheduleConfiguration.end_datetime) {
            return null
        }
        return formatDatetime(
            scheduleConfiguration.end_datetime,
            dateLabel,
            timezone
        )
    }, [scheduleConfiguration.end_datetime, dateLabel, timezone])
    let message

    if (scheduleConfiguration.schedule_rule in SCHEDULE_RULE_LABELS) {
        message = defaultMessageTemplate({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            label: SCHEDULE_RULE_LABELS[
                scheduleConfiguration.schedule_rule as string
            ],
            timezone,
        })
    }

    // Custom
    if (
        scheduleConfiguration.schedule_rule ===
        CampaignScheduleRuleValueEnum.Custom
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
