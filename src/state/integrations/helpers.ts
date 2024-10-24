import {fromJS, List, Map} from 'immutable'
import _find from 'lodash/find'
import moment from 'moment-timezone'

import {IntegrationConfig, INTEGRATION_TYPE_CONFIG} from 'config'
import {
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'
import {IntegrationType} from 'models/integration/constants'
import {
    GorgiasChatStatusEnum,
    IntegrationDataItemType,
} from 'models/integration/types'
import {InstallationStatus} from 'rest_api/gorgias_chat_protected_api/types'
import GorgiasApi from 'services/gorgiasApi'
import {AccountSettingBusinessHours} from 'state/currentAccount/types'
import {assetsUrl} from 'utils'

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

export const getIconFromType = (type: IntegrationType): string => {
    const config = getIntegrationConfig(type)
    const filePath =
        (config && typeof config === 'object' && config.image) || ''
    return filePath === '' ? '' : assetsUrl(filePath)
}

/**
 * Fetch integration data items that match given product IDs
 */
export const fetchIntegrationProducts = async (
    integrationId: number,
    productsIds: number[]
): Promise<Map<string, any>[]> => {
    const products: Map<string, any>[] = []

    const api = new GorgiasApi()
    const generator = api.getIntegrationDataItems(
        integrationId,
        IntegrationDataItemType.IntegrationDataItemTypeProduct,
        productsIds
    )

    for await (const items of generator) {
        items.forEach((item: Map<string, any>) => {
            if (item.get('data')) {
                products.push(item.get('data'))
            }
        })
    }

    return products
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

const INSTALLATION_THRESHOLD_HOURS = 12

// "installed" status should be ignored if chat was recently added by one click installation
const getShouldIgnoreInstalledStatus = (chat: Map<any, any>): boolean => {
    const oneClickInstallationDatetime = chat.getIn([
        'meta',
        'one_click_installation_datetime',
    ])

    if (!oneClickInstallationDatetime) {
        return false
    }

    const isChatAddedByOneClickInstallation =
        (chat.getIn(['meta', 'shopify_integration_ids']) as List<any>)?.size !==
        0

    const duration = moment.duration(
        moment().diff(moment(oneClickInstallationDatetime))
    )
    const hours = duration.asHours()

    return (
        hours <= INSTALLATION_THRESHOLD_HOURS &&
        isChatAddedByOneClickInstallation
    )
}

// "installed" status should be ignored if chat was recently removed by one click installation
const getShouldForceShowChatAsUninstalled = (chat: Map<any, any>): boolean => {
    const oneClickUninstallationDatetime = chat.getIn([
        'meta',
        'one_click_uninstallation_datetime',
    ])

    if (!oneClickUninstallationDatetime) {
        return false
    }

    const isChatRemovedByOneClickInstallation =
        (chat.getIn(['meta', 'shopify_integration_ids']) as List<any>)?.size ===
        0

    const duration = moment.duration(
        moment().diff(moment(oneClickUninstallationDatetime))
    )
    const hours = duration.asHours()

    return (
        hours <= INSTALLATION_THRESHOLD_HOURS &&
        isChatRemovedByOneClickInstallation
    )
}

/**
 * Calculate chat live status using different chat settings
 */

export const computeChatIntegrationStatus = (
    chat: Map<any, any>,
    isBusinessHours: boolean,
    installationStatus: InstallationStatus
): GorgiasChatStatusEnum | null => {
    const shouldIgnoreInstalledStatus = getShouldIgnoreInstalledStatus(chat)
    const shouldForceShowChatAsUninstalled =
        getShouldForceShowChatAsUninstalled(chat)

    if (shouldForceShowChatAsUninstalled) {
        return GorgiasChatStatusEnum.NOT_INSTALLED
    }

    if (!installationStatus.installed && !shouldIgnoreInstalledStatus) {
        return GorgiasChatStatusEnum.NOT_INSTALLED
    }

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
