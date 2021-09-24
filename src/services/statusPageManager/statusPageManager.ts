import moment from 'moment'
import {removeNotification} from 'reapop'
import {EnhancedStore} from '@reduxjs/toolkit'
import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'

import {store as reduxStore} from '../../init'
import {notify} from '../../state/notifications/actions'
import {NotificationStatus} from '../../state/notifications/types'
import {getActiveIntegrations} from '../../state/integrations/selectors'
import {IntegrationType} from '../../models/integration/types'
import {tryLocalStorage} from '../common/utils'

import {
    ComponentStatus,
    MaintenanceStatus,
    Page,
    StatusPageComponent,
    StatusPageScheduledMaintenanceResponseData,
    StatusPageIncident,
    StatusPageIncidentsResponseData,
} from './types'

import {
    CLUSTER_GROUP_ID,
    INCIDENTS_NOTIFICATION_ID,
    INCIDENTS_POLLING_INTERVAL_SECONDS,
    HELPDESK_GROUP_IDS,
    INTEGRATION_COMPONENTS_TYPES,
    MAINTENANCE_NOTIFICATION_BEFORE_MINUTES,
    MAINTENANCE_NOTIFICATION_ID,
    MAINTENANCE_POLLING_INTERVAL_SECONDS,
    PAGE_ID,
    INCIDENT_IMPACT_LABEL,
    DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
} from './constants'

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

    constructor() {
        if (window.StatusPage) {
            // docs: https://status.gorgias.com/api#status
            this.statusPage = new window.StatusPage.page({page: PAGE_ID})
        }
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
            INCIDENTS_POLLING_INTERVAL_SECONDS * 1000
        )

        this.fetchScheduledMaintenancesInterval = window.setInterval(
            this.fetchScheduledMaintenances,
            MAINTENANCE_POLLING_INTERVAL_SECONDS * 1000
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

    static isIncidentImpactingCurrentCluster({components}: StatusPageIncident) {
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
        components: StatusPageComponent[],
        activeIntegrationsTypes: ImmutableSet<IntegrationType>
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

            if (groupName && component.status !== ComponentStatus.Operational) {
                if (
                    affectedIntegrationType &&
                    !activeIntegrationsTypes.includes(affectedIntegrationType)
                ) {
                    return false
                }
                return true
            }
        })
    }

    static hideNotification(id: string) {
        const notificationIds: string[] = StatusPageManager.getSavedNotificationIds()
        notificationIds.push(id)
        StatusPageManager.saveNotificationIds(notificationIds)
    }

    static saveNotificationIds(notificationIds: string[]) {
        tryLocalStorage(() =>
            window.localStorage.setItem(
                DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
                JSON.stringify(notificationIds)
            )
        )
    }

    static getSavedNotificationIds(): string[] {
        return JSON.parse(
            window.localStorage.getItem(
                DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY
            ) || '[]'
        ) as string[]
    }

    processIncidents = (data: StatusPageIncidentsResponseData) => {
        const activeIntegrations = getActiveIntegrations(this.store.getState())
        const activeIntegrationsTypes: ImmutableSet<IntegrationType> = activeIntegrations
            .map(
                (integration: ImmutableMap<any, any>) =>
                    integration.get('type') as IntegrationType
            )
            .toSet()

        const relevantIncidents = data.incidents
            .filter((incident) =>
                StatusPageManager.isIncidentImpactingCurrentCluster(incident)
            )
            .map((incident) => ({
                ...incident,
                components: StatusPageManager.getAffectedComponents(
                    incident.components,
                    activeIntegrationsTypes
                ),
            }))
            .filter((incident) => incident.components.length)

        // remove all previous notifications
        this.previousIncidentsIds.forEach((id) => {
            this.store.dispatch(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                removeNotification(`${INCIDENTS_NOTIFICATION_ID}-${id}`)
            )
        })
        this.previousIncidentsIds = []

        const relevantIncidentsIds = relevantIncidents.map(({id}) => id)
        // notifications dismissed by user are retrieved in localStorage
        const closedNotificationIds: string[] = StatusPageManager.getSavedNotificationIds()
        const cleanedNotificationIds = closedNotificationIds.filter(
            (id: string) => relevantIncidentsIds.includes(id)
        )
        StatusPageManager.saveNotificationIds(cleanedNotificationIds)

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
                        HELPDESK_GROUP_IDS[component.group_id]
                    )
                    // we have a lot of components -> only show a couple
                    if (notification.componentNames.size < 5) {
                        notification.componentNames.add(component.name)
                    }
                })
                const components = `${Array.from(
                    notification.componentNames
                ).join(', ')} component${
                    notification.componentNames.size > 1 ? 's' : ''
                }`
                const message = `
                Currently experiencing ${
                    notification.label
                } in our ${Array.from(notification.groupNames).join(
                    ' & '
                )} affecting ${components}.
                Find out more on our <u><a href="${
                    data.page.url
                }" target="_blank" rel="noreferrer noopener">status page</a></u>.`

                this.store.dispatch(
                    notify({
                        id: `${INCIDENTS_NOTIFICATION_ID}-${incident.id}`,
                        status: notification.status,
                        style: 'banner',
                        message,
                        allowHTML: true,
                        dismissible: false,
                        closable: true,
                        onClose: () =>
                            StatusPageManager.hideNotification(incident.id),
                    } as any) as any
                )
            }
        }
    }

    processScheduledMaintenances = (
        data: StatusPageScheduledMaintenanceResponseData
    ) => {
        const notification = {
            label: '',
            groupNames: new Set(),
            componentNames: new Set(),
        }

        // remove all previous maintenance notifications
        //eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.store.dispatch(removeNotification(MAINTENANCE_NOTIFICATION_ID))

        for (const maintenance of data.scheduled_maintenances) {
            const now = moment()
            const scheduledFor = moment(maintenance.scheduled_for)
            const startsInMinutes = moment(maintenance.scheduled_for).diff(
                now,
                'minutes'
            )

            if (maintenance.status === MaintenanceStatus.Completed) {
                continue
            }

            // don't show maintenance events that are scheduled in the distant future.
            if (
                maintenance.status === MaintenanceStatus.Scheduled &&
                startsInMinutes > MAINTENANCE_NOTIFICATION_BEFORE_MINUTES
            ) {
                continue
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

            if (!notification.groupNames.size) {
                continue
            }

            const startText = startsInMinutes > 0 ? 'will start' : 'started'
            const message = `A scheduled maintenance for
${Array.from(notification.groupNames).join(' & ')} affecting
${Array.from(notification.componentNames).join(
    ', '
)} ${startText} <em>${scheduledFor.fromNow()}</em>.

Find out more on our <u><a href="${
                data.page.url
            }" target="_blank" rel="noreferrer noopener">status page</a></u>.`

            this.store.dispatch(
                notify({
                    id: MAINTENANCE_NOTIFICATION_ID,
                    status:
                        maintenance.status === MaintenanceStatus.Scheduled
                            ? NotificationStatus.Info
                            : NotificationStatus.Warning,
                    style: 'banner',
                    message: message,
                    allowHTML: true,
                    dismissible: false,
                }) as any
            )

            return // only take a single maintenance at a time.
        }
    }
}

export default new StatusPageManager()
