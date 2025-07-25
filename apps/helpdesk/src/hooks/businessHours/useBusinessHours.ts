import { useCallback } from 'react'

import {
    BusinessHoursConfig,
    BusinessHoursTimeframe,
} from '@gorgias/helpdesk-types'

import { TimeFormatType } from 'constants/datetime'
import useAppSelector from 'hooks/useAppSelector'
import { DAYS_OPTIONS } from 'pages/settings/businessHours/constants'
import { convertToAmPm } from 'pages/settings/businessHours/utils'
import { getTimeFormatPreferenceSetting } from 'state/currentUser/selectors'

export const useBusinessHours = () => {
    const timeFormatSetting = useAppSelector(getTimeFormatPreferenceSetting)

    const getBusinessHoursTimeframeLabel = useCallback(
        (businessHoursTimeFrame: BusinessHoursTimeframe) => {
            let from_time =
                timeFormatSetting === TimeFormatType.AmPm
                    ? convertToAmPm(businessHoursTimeFrame.from_time)
                    : businessHoursTimeFrame.from_time
            let to_time =
                timeFormatSetting === TimeFormatType.AmPm
                    ? convertToAmPm(businessHoursTimeFrame.to_time)
                    : businessHoursTimeFrame.to_time

            const displayName = DAYS_OPTIONS.find(
                (day) => day.value === businessHoursTimeFrame.days,
            )?.label

            const timeRange = `${from_time}-${to_time}`

            if (!displayName) {
                return timeRange
            }

            return `${displayName}, ${timeRange}`
        },
        [timeFormatSetting],
    )

    const getBusinessHoursConfigLabel = useCallback(
        (
            businessHoursConfig: BusinessHoursConfig,
            show_timezone: boolean = false,
        ) => {
            if (businessHoursConfig.business_hours.length === 0) {
                return 'Outside business hours'
            }

            const timeframe = businessHoursConfig.business_hours
                .map((businessHours) =>
                    getBusinessHoursTimeframeLabel(businessHours),
                )
                .join(' | ')

            if (show_timezone) {
                return `${timeframe}, ${businessHoursConfig.timezone}`
            }

            return timeframe
        },
        [getBusinessHoursTimeframeLabel],
    )

    return { getBusinessHoursConfigLabel }
}
