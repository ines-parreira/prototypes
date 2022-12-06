import {fromJS, List, Map} from 'immutable'
import moment from 'moment-timezone'
import _find from 'lodash/find'

import {IntegrationConfig, INTEGRATION_TYPE_CONFIG} from 'config'
import {
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'
import {IntegrationType} from 'models/integration/constants'
import {GorgiasChatStatusEnum} from 'models/integration/types'
import {AccountSettingBusinessHours} from 'state/currentAccount/types'
import {getIconFromUrl} from '../../utils'

export const getIntegrationsByTypes = (
    integrations: List<any> = fromJS([]),
    types: Array<string> = []
): List<any> =>
    integrations.filter((inte: Map<any, any>) =>
        types.includes(inte.get('type', ''))
    ) as List<any>

export const getIntegrationConfig = (
    type: IntegrationType
): IntegrationConfig | undefined => {
    return _find(INTEGRATION_TYPE_CONFIG, {type})
}

export const getIconUrl = (type: IntegrationType): string => {
    const config = getIntegrationConfig(type)
    return config && typeof config === 'object' && config.image
        ? config.image
        : ''
}

export const getIconFromType = (type: IntegrationType): string => {
    return getIconFromUrl(`integrations/${getIconUrl(type)}`)
}

/**
 * Check if now is during account's business hour
 */
export function isAccountDuringBusinessHours(
    accountBusinessHoursSetting?: AccountSettingBusinessHours | null
) {
    if (!accountBusinessHoursSetting) {
        return false
    }

    const {business_hours: businessHoursSettings, timezone} =
        accountBusinessHoursSetting.data
    const now = moment.tz(timezone)
    const weekday = !now.weekday() ? 7 : now.weekday() // transform Sunday from 0 to 7

    return businessHoursSettings.reduce(
        (isBusinessHours, businessHoursSetting) => {
            if (isBusinessHours) {
                return isBusinessHours
            }

            const {
                days: daysString,
                from_time: fromTimeString,
                to_time: toTimeString,
            } = businessHoursSetting

            const days = daysString.split(',').map((day) => parseInt(day, 10))

            if (!days.includes(weekday)) {
                return false
            }

            const [fromTimeHours, fromTimeMinutes] = fromTimeString
                .split(':')
                .map((value) => parseInt(value, 10))
            const fromTime = moment
                .tz(timezone)
                .hours(fromTimeHours)
                .minutes(fromTimeMinutes)
                .seconds(0)

            const [toTimeHours, toTimeMinutes] = toTimeString
                .split(':')
                .map((value) => parseInt(value, 10))
            const toTime = moment
                .tz(timezone)
                .hours(toTimeHours)
                .minutes(toTimeMinutes)
                .seconds(0)

            return now.isBetween(fromTime, toTime, 'seconds', '[]') // [] means inclusive
        },
        false
    )
}

/**
 * Calculate chat live status using different chat settings
 */
export const computeChatIntegrationStatus = (
    chat: Map<any, any>,
    isBusinessHours: boolean
): GorgiasChatStatusEnum | null => {
    if (!!chat.get('deactivated_datetime')) {
        return GorgiasChatStatusEnum.HIDDEN
    }

    const isHideOutsideBusinessHoursEnabled = !!chat.getIn(
        ['meta', 'preferences', 'hide_outside_business_hours'],
        false
    )

    if (!isBusinessHours) {
        if (isHideOutsideBusinessHoursEnabled) {
            return GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS
        }

        return GorgiasChatStatusEnum.OFFLINE
    }

    const liveChatAvailability = chat.getIn(
        ['meta', 'preferences', 'live_chat_availability'],
        GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
    )

    switch (liveChatAvailability) {
        case GORGIAS_CHAT_LIVE_CHAT_OFFLINE:
            return GorgiasChatStatusEnum.OFFLINE
        case GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS:
            return GorgiasChatStatusEnum.ONLINE
        default:
            // for "auto" option, we need to fetch agents data from chat api
            return null
    }
}
