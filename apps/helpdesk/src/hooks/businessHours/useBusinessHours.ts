import { useCallback } from 'react'

import {
    BusinessHoursConfig,
    BusinessHoursTimeframe,
} from '@gorgias/helpdesk-types'

import { TimeFormatType } from 'constants/datetime'
import useAppSelector from 'hooks/useAppSelector'
import {
    ALWAYS_ON_OPTION_LABEL,
    DAYS_OPTIONS_WITHOUT_ALWAYS_ON,
    EVERYDAY_OPTION_VALUE,
} from 'pages/settings/businessHours/constants'
import { convertToAmPm } from 'pages/settings/businessHours/utils'
import { getTimeFormatPreferenceSetting } from 'state/currentUser/selectors'

export const useBusinessHours = () => {
    const timeFormatSetting = useAppSelector(getTimeFormatPreferenceSetting)

    const getBusinessHoursTimeFrameLabel = useCallback(
        (businessHoursTimeFrame: BusinessHoursTimeframe) => {
            let fromTime =
                timeFormatSetting === TimeFormatType.AmPm
                    ? convertToAmPm(businessHoursTimeFrame.from_time)
                    : businessHoursTimeFrame.from_time
            let toTime =
                timeFormatSetting === TimeFormatType.AmPm
                    ? convertToAmPm(businessHoursTimeFrame.to_time)
                    : businessHoursTimeFrame.to_time

            const days = businessHoursTimeFrame.days

            if (
                days === EVERYDAY_OPTION_VALUE &&
                businessHoursTimeFrame.to_time === '00:00' &&
                businessHoursTimeFrame.from_time === '00:00'
            ) {
                return ALWAYS_ON_OPTION_LABEL
            }

            const displayName = DAYS_OPTIONS_WITHOUT_ALWAYS_ON.find(
                (day) => day.value === businessHoursTimeFrame.days,
            )?.label

            const timeRange = `${fromTime}-${toTime}`

            if (!displayName) {
                return timeRange
            }

            return `${displayName}, ${timeRange}`
        },
        [timeFormatSetting],
    )

    const getBusinessHoursConfigTimeFrameLabelList = useCallback(
        (businessHoursConfig: BusinessHoursConfig) => {
            if (businessHoursConfig.business_hours.length === 0) {
                return ['Outside business hours']
            }

            return businessHoursConfig.business_hours.map((businessHours) =>
                getBusinessHoursTimeFrameLabel(businessHours),
            )
        },
        [getBusinessHoursTimeFrameLabel],
    )

    const getBusinessHoursConfigLabel = useCallback(
        (
            businessHoursConfig: BusinessHoursConfig,
            showTimezone: boolean = false,
        ) => {
            if (businessHoursConfig.business_hours.length === 0) {
                return 'Outside business hours'
            }

            const configLabel =
                getBusinessHoursConfigTimeFrameLabelList(
                    businessHoursConfig,
                ).join(' | ')

            if (showTimezone) {
                return `${configLabel}, ${businessHoursConfig.timezone}`
            }

            return configLabel
        },
        [getBusinessHoursConfigTimeFrameLabelList],
    )

    return {
        getBusinessHoursConfigTimeFrameLabelList,
        getBusinessHoursConfigLabel,
    }
}
