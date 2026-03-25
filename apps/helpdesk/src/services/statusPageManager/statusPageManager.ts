import type { EnhancedStore } from '@reduxjs/toolkit'
import { tryLocalStorage } from '@repo/browser-storage'
import type { Map as ImmutableMap, Set as ImmutableSet } from 'immutable'
import moment from 'moment'
import { dismissNotification } from 'reapop'

import { AlertBannerTypes } from 'AlertBanners'
import { store as reduxStore } from 'common/store'
import type { HelpCenter } from 'models/helpCenter/types'
import type { IntegrationType } from 'models/integration/types'
import { getHelpCenters } from 'state/entities/helpCenter/helpCenters'
import { getActiveIntegrations } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStyle } from 'state/notifications/types'

import {
    CLUSTER_GROUP_ID,
    DISMISSED_MAINTENANCES_LOCAL_STORAGE_KEY,
    DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
    HELPCENTER_GROUP_ID,
    HELPDESK_GROUP_IDS,
    INCIDENT_IMPACT_LABEL,
    INCIDENTS_NOTIFICATION_ID,
    INCIDENTS_POLLING_INTERVAL_SECONDS,
    INTEGRATION_COMPONENTS_TYPES,
    MAINTENANCE_NOTIFICATION_BEFORE_MINUTES,
    MAINTENANCE_NOTIFICATION_ID,
    MAINTENANCE_POLLING_INTERVAL_SECONDS,
    PAGE_ID,
} from './constants'
import type {
    Page,
    StatusPageComponent,
    StatusPageIncident,
    StatusPageIncidentsResponseData,
    StatusPageScheduledMaintenance,
    StatusPageScheduledMaintenanceResponseData,
} from './types'
import { ComponentStatus, IncidentImpact, MaintenanceStatus } from './types'

//$TsFixMe remove once init.js is migrated
const typeSafeReduxStore = reduxStore as EnhancedStore

/**
 * Display notifications to users about incidents (with our components or maintenance cycle) from our status page:
 * https://status.gorgias.com/
 *
 * StatusPage JS SDK documentation: https://status.gorgias.com/api
 */
export class StatusPageManager {
    readonly statusPage: Maybe<Page> = null
    private store = typeSafeReduxStore
    private fetchScheduledMaintenancesInterval: number | null = null
    private fetchUnresolvedIncidentsInterval: number | null = null
    private previousIncidentsIds: string[] = []
    private activeIntegrationsTypes: ImmutableSet<IntegrationType>

    constructor() {
        if (window.StatusPage) {
            // docs: https://status.gorgias.com/api#status
            this.statusPage = new window.StatusPage.page({ page: PAGE_ID })
        }

        const activeIntegrations = getActiveIntegrations(this.store.getState())
        this.activeIntegrationsTypes = activeIntegrations
            .map(
                (integration: ImmutableMap<any, any>) =>
                    integration.get('type') as IntegrationType,
            )
            .toSet()
    }

    startPolling = () => {
        if (!this.statusPage) {
            return
        }

        this.fetchUnresolvedIncidents()
        this.fetchScheduledMaintenances()

        // since the status can change we need to poll them continuously to give updates to users.
        this.fetchUnresolvedIncidentsInterval = window.setInterval(
            this.fetchUnresolvedIncidents,
            INCIDENTS_POLLING_INTERVAL_SECONDS * 1000,
        )

        this.fetchScheduledMaintenancesInterval = window.setInterval(
            this.fetchScheduledMaintenances,
            MAINTENANCE_POLLING_INTERVAL_SECONDS * 1000,
        )
    }

    stopPolling = () => {
        window.clearInterval(this.fetchUnresolvedIncidentsInterval as number)
        window.clearInterval(this.fetchScheduledMaintenancesInterval as number)
    }

    /**
     * Fetch & Process scheduled maintenance status updates. Docs: https://status.gorgias.com/api#scheduled-maintenances
     */
    private fetchScheduledMaintenances = () => {
        if (!this.statusPage) {
            return
        }
        this.statusPage.scheduled_maintenances({
            success: this.processScheduledMaintenances,
        })
    }

    /**
     * Fetch & Process unresolved incidents. Docs: https://status.gorgias.com/api#incidents-unresolved
     */
    private fetchUnresolvedIncidents = () => {
        if (!this.statusPage) {
            return
        }
        this.statusPage.incidents({
            filter: 'unresolved',
            success: this.processIncidents,
        })
    }

    static isEventImpactingCurrentCluster({
        components,
    }: StatusPageIncident | StatusPageScheduledMaintenance) {
        let areClustersAffected = false

        for (const component of components) {
            if (component.group_id === CLUSTER_GROUP_ID) {
                areClustersAffected = true
                if (component.name === window.GORGIAS_CLUSTER) {
                    return true
                }
            }
        }
        return !areClustersAffected
    }

    static getAffectedComponents(
        impact: IncidentImpact,
        components: StatusPageComponent[],
        helpCenters: Record<string, HelpCenter>,
        activeIntegrationsTypes?: ImmutableSet<IntegrationType>,
    ) {
        return components.filter((component) => {
            const affectedIntegrationType =
                INTEGRATION_COMPONENTS_TYPES[component.id]
            const groupName = HELPDESK_GROUP_IDS[component.group_id]
            if (
                component.group_id === CLUSTER_GROUP_ID &&
                component.name !== window.GORGIAS_CLUSTER
            ) {
                return false
            }

            if (
                groupName &&
                (impact === IncidentImpact.Maintenance ||
                    component.status !== ComponentStatus.Operational)
            ) {
                if (
                    affectedIntegrationType &&
                    !activeIntegrationsTypes?.includes(affectedIntegrationType)
                ) {
                    return false
                }

                if (
                    component.group_id === HELPCENTER_GROUP_ID &&
                    !Object.keys(helpCenters).length
                ) {
                    return false
                }
                return true
            }
        })
    }

    static hideNotification(id: string, localStorageKey: string) {
        const notificationIds: string[] =
            StatusPageManager.getSavedNotificationIds(localStorageKey)
        notificationIds.push(id)
        StatusPageManager.saveNotificationIds(notificationIds, localStorageKey)
    }

    static saveNotificationIds(
        notificationIds: string[],
        localStorageKey: string,
    ) {
        tryLocalStorage(() =>
            window.localStorage.setItem(
                localStorageKey,
                JSON.stringify(notificationIds),
            ),
        )
    }

    static getSavedNotificationIds(localStorageKey: string): string[] {
        return JSON.parse(
            window.localStorage.getItem(localStorageKey) || '[]',
        ) as string[]
    }

    processIncidents = (data: StatusPageIncidentsResponseData) => {
        const helpCenters = getHelpCenters(this.store.getState())

        const relevantIncidents = data.incidents
            .filter((incident) =>
                StatusPageManager.isEventImpactingCurrentCluster(incident),
            )
            .map((incident) => ({
                ...incident,
                components: StatusPageManager.getAffectedComponents(
                    incident.impact,
                    incident.components,
                    helpCenters,
                    this.activeIntegrationsTypes,
                ),
            }))
            .filter((incident) => incident.components.length)

        // remove all previous notifications
        this.previousIncidentsIds.forEach((id) => {
            this.store.dispatch(
                dismissNotification(`${INCIDENTS_NOTIFICATION_ID}-${id}`),
            )
        })
        this.previousIncidentsIds = []

        const relevantIncidentsIds = relevantIncidents.map(({ id }) => id)
        // notifications dismissed by user are retrieved in localStorage
        const closedNotificationIds = StatusPageManager.getSavedNotificationIds(
            DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
        )
        const cleanedNotificationIds = closedNotificationIds.filter((id) =>
            relevantIncidentsIds.includes(id),
        )

        // clear local storage from irrelevant/outdated incidents ids
        StatusPageManager.saveNotificationIds(
            cleanedNotificationIds,
            DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
        )

        for (const incident of relevantIncidents) {
            if (!closedNotificationIds.includes(incident.id)) {
                this.previousIncidentsIds.push(incident.id)
                const incidentStatus = INCIDENT_IMPACT_LABEL[incident.impact]
                const notification = {
                    level: incidentStatus.level,
                    status: incidentStatus.status,
                    label: incidentStatus.label,
                    groupNames: new Set(),
                    componentNames: new Set(),
                }

                incident.components.forEach((component) => {
                    // if there are mixed incident levels we combine the groups/names - this can lead to some
                    // confusion, but it can be resolved by looking at the status page incident itself.
                    notification.groupNames.add(
                        HELPDESK_GROUP_IDS[component.group_id],
                    )
                    // we have a lot of components -> only show a couple
                    if (notification.componentNames.size < 5) {
                        notification.componentNames.add(component.name)
                    }
                })
                const components = `${Array.from(
                    notification.componentNames,
                ).join(', ')} component${
                    notification.componentNames.size > 1 ? 's' : ''
                }`
                const message = `
                Currently experiencing ${
                    notification.label
                } in our ${Array.from(notification.groupNames).join(
                    ' & ',
                )} affecting ${components}.
                Find out more on our <a href="${
                    data.page.url
                }" target="_blank" rel="noreferrer noopener">status page</a>.`

                this.store.dispatch(
                    notify({
                        id: `${INCIDENTS_NOTIFICATION_ID}-${incident.id}`,
                        style: NotificationStyle.Banner,
                        type: notification.status,
                        message,
                        onClose: () =>
                            StatusPageManager.hideNotification(
                                incident.id,
                                DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
                            ),
                    }) as any,
                )
            }
        }
    }

    processScheduledMaintenances = (
        data: StatusPageScheduledMaintenanceResponseData,
    ) => {
        this.store.dispatch(dismissNotification(MAINTENANCE_NOTIFICATION_ID))

        const now = moment()
        const helpCenters = getHelpCenters(this.store.getState())

        const [maintenance] = data.scheduled_maintenances
            .filter((maintenance) => {
                const isOnCurrentCluster =
                    StatusPageManager.isEventImpactingCurrentCluster(
                        maintenance,
                    )

                const startsInMinutes = moment(maintenance.scheduled_for).diff(
                    now,
                    'minutes',
                )

                const isInTimeRange =
                    maintenance.status !== MaintenanceStatus.Completed &&
                    !(
                        maintenance.status === MaintenanceStatus.Scheduled &&
                        startsInMinutes >
                            MAINTENANCE_NOTIFICATION_BEFORE_MINUTES
                    )

                return isOnCurrentCluster && isInTimeRange
            })
            .map((maintenance) => ({
                ...maintenance,
                components: StatusPageManager.getAffectedComponents(
                    maintenance.impact,
                    maintenance.components,
                    helpCenters,
                    this.activeIntegrationsTypes,
                ),
            }))
            .filter((maintenance) => maintenance.components.length)

        if (maintenance) {
            // notifications dismissed by user are retrieved in localStorage
            const closedNotificationIds =
                StatusPageManager.getSavedNotificationIds(
                    DISMISSED_MAINTENANCES_LOCAL_STORAGE_KEY,
                )

            const cleanedNotificationIds = closedNotificationIds.filter(
                (id) => maintenance.id === id,
            )

            StatusPageManager.saveNotificationIds(
                cleanedNotificationIds,
                DISMISSED_MAINTENANCES_LOCAL_STORAGE_KEY,
            )

            if (
                maintenance.status === MaintenanceStatus.InProgress &&
                cleanedNotificationIds.includes(maintenance.id)
            ) {
                StatusPageManager.saveNotificationIds(
                    cleanedNotificationIds.filter(
                        (id) => id !== maintenance.id,
                    ),
                    DISMISSED_MAINTENANCES_LOCAL_STORAGE_KEY,
                )
            }

            if (
                !closedNotificationIds.includes(maintenance.id) ||
                (closedNotificationIds.includes(maintenance.id) &&
                    maintenance.status === MaintenanceStatus.InProgress)
            ) {
                const notification = {
                    label: '',
                    groupNames: new Set(),
                    componentNames: new Set(),
                }

                // get affected component groups and names
                for (const component of maintenance.components) {
                    const groupName = HELPDESK_GROUP_IDS[component.group_id]
                    if (!groupName) {
                        continue
                    }
                    notification.groupNames.add(groupName)
                    if (notification.componentNames.size < 5) {
                        notification.componentNames.add(component.name)
                    } else {
                        break
                    }
                }

                const scheduledFor = moment(maintenance.scheduled_for)
                const startsInMinutes = scheduledFor.diff(now, 'minutes')
                const startText = startsInMinutes > 0 ? 'will start' : 'started'

                const message = `A scheduled maintenance for
${Array.from(notification.groupNames).join(' & ')} affecting
${Array.from(notification.componentNames).join(
    ', ',
)} ${startText} <em>${scheduledFor.fromNow()}</em>.

Find out more on our <a href="${
                    data.page.url
                }" target="_blank" rel="noreferrer noopener">status page</a>.`

                this.store.dispatch(
                    notify({
                        id: MAINTENANCE_NOTIFICATION_ID,
                        style: NotificationStyle.Banner,
                        type:
                            maintenance.status === MaintenanceStatus.Scheduled
                                ? AlertBannerTypes.Info
                                : AlertBannerTypes.Warning,
                        message,
                        onClose: () =>
                            StatusPageManager.hideNotification(
                                maintenance.id,
                                DISMISSED_MAINTENANCES_LOCAL_STORAGE_KEY,
                            ),
                    }) as any,
                )
            }
        }
    }
}

const statusPageManager = new StatusPageManager()

export default statusPageManager
