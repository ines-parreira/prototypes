import EventTracker from '@gorgias/event-tracker-api'

import { UserRole } from 'config/types/user'
import { ingestionEndpoint, reportSentryError } from 'services/activityTracker'
import { GorgiasAppAuthService } from 'utils/gorgiasAppsAuth'

import { checkIfAiAgentOnboardingNotificationIsEnabled } from './utils'

const appAuthService = new GorgiasAppAuthService()
const notificationTrackerInstance = EventTracker.initialize({
    endpoint: ingestionEndpoint,
    cloudEventsConfig: {
        source: `//${window.GORGIAS_CLUSTER}/helpdesk-web-app`,
        dataschemaGroupId: 'notifications',
        partitionkey: `{"accountId": ${window.GORGIAS_STATE?.currentAccount?.id}}`,
        reverseDNSName: 'com.gorgias.notifications',
    },
    enableQueue: false,
    getApiHeaders: async () => {
        return await appAuthService.getAccessTokenHeaders()
    },
    reportError: reportSentryError,
})

export const getAdminRecipientIds = () => {
    const allAdmins = window.GORGIAS_STATE?.agents?.all.filter(
        (agent) => agent.role.name === UserRole.Admin,
    )

    const adminIdsList = allAdmins?.map((admin) => ({
        id: `${window.GORGIAS_STATE?.currentAccount?.id}.${admin.id}`,
    }))

    const sortedAdminIds = [...(adminIdsList || [])].sort((a, b) =>
        a.id.localeCompare(b.id),
    )

    return sortedAdminIds
}

notificationTrackerInstance.createUserContext({
    account_id: window.GORGIAS_STATE?.currentAccount?.id,
    recipient_ids: getAdminRecipientIds(),
})

// after feature flags are removed, these helper functions can be removed
// as the check will be redundant
const logNotificationEventWithLD = async (
    ...args: Parameters<typeof notificationTrackerInstance.logEvent>
) => {
    const isAiAgentOnboardingNotificationEnabled =
        await checkIfAiAgentOnboardingNotificationIsEnabled()
    if (isAiAgentOnboardingNotificationEnabled) {
        notificationTrackerInstance.logEvent(...args)
    } else {
        return
    }
}

export const logNotificationEvent = (
    ...args: Parameters<typeof notificationTrackerInstance.logEvent>
) => {
    void logNotificationEventWithLD(...args)
}

export default notificationTrackerInstance
