import moment from 'moment'
import {removeNotification} from 'reapop'
import {EnhancedStore} from '@reduxjs/toolkit'
import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'

import {store as reduxStore} from '../../init.js'
import {notify} from '../../state/notifications/actions'
import {NotificationStatus} from '../../state/notifications/types'
import {getActiveIntegrations} from '../../state/integrations/selectors'
import {IntegrationType} from '../../models/integration/types'

import {
    ComponentStatus,
    MaintenanceStatus,
    Page,
    StatusPageComponentsResponseData,
    StatusPageScheduledMaintenanceResponseData,
} from './types'

import {
    CLUSTER_GROUP_ID,
    COMPONENT_STATUS_LABEL,
    COMPONENTS_NOTIFICATION_ID,
    COMPONENTS_POLLING_INTERVAL_SECONDS,
    HELPDESK_GROUP_IDS,
    INTEGRATION_COMPONENTS_TYPES,
    MAINTENANCE_NOTIFICATION_BEFORE_MINUTES,
    MAINTENANCE_NOTIFICATION_ID,
    MAINTENANCE_POLLING_INTERVAL_SECONDS,
    PAGE_ID,
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
    statusPage: Maybe<Page> = null
    store = typeSafeReduxStore
    fetchComponentsInterval: Maybe<number> = null
    fetchScheduledMaintenancesInterval: Maybe<number> = null

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

        this.fetchComponents()
        this.fetchScheduledMaintenances()

        // since the status can change we need to poll them continuously to give updates to users.
        this.fetchComponentsInterval = window.setInterval(
            this.fetchComponents,
            COMPONENTS_POLLING_INTERVAL_SECONDS * 1000
        )

        this.fetchScheduledMaintenancesInterval = window.setInterval(
            this.fetchScheduledMaintenances,
            MAINTENANCE_POLLING_INTERVAL_SECONDS * 1000
        )
    }

    stopPolling = () => {
        window.clearInterval(this.fetchComponentsInterval as number)
        window.clearInterval(this.fetchScheduledMaintenancesInterval as number)
    }

    /**
     * Fetch & Process components status updates. Docs: https://status.gorgias.com/api#components
     */
    fetchComponents = () => {
        if (!this.statusPage) {
            return
        }
        this.statusPage.components({success: this.processComponents})
    }

    /**
     * Fetch & Process scheduled maintenance status updates. Docs: https://status.gorgias.com/api#scheduled-maintenances
     */
    fetchScheduledMaintenances = () => {
        if (!this.statusPage) {
            return
        }
        this.statusPage.scheduled_maintenances({
            success: this.processScheduledMaintenances,
        })
    }

    processComponents = (data: StatusPageComponentsResponseData) => {
        const notification = {
            level: -1,
            status: NotificationStatus.Info,
            label: '',
            groupNames: new Set(),
            componentNames: new Set(),
        }
        const activeIntegrations = getActiveIntegrations(this.store.getState())
        const activeIntegrationsTypes: ImmutableSet<IntegrationType> = activeIntegrations
            .map(
                (integration: ImmutableMap<any, any>) =>
                    integration.get('type') as IntegrationType
            )
            .toSet()
        let clustersAffected = false
        let foundCluster = false

        // remove all previous notifications
        //eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.store.dispatch(removeNotification(COMPONENTS_NOTIFICATION_ID))

        // Filter incidents per cluster.
        for (const component of data.components) {
            if (component.status === ComponentStatus.Operational) {
                continue
            }

            if (component.group_id === CLUSTER_GROUP_ID) {
                clustersAffected = true

                if (component.name === window.GORGIAS_CLUSTER) {
                    foundCluster = true
                    break
                }
            }
        }

        // if no clusters components are affected then show the notification - meaning that it affects all clusters.
        if (clustersAffected && !foundCluster) {
            return
        }

        // We're only interested in certain components
        for (const component of data.components) {
            const groupName = HELPDESK_GROUP_IDS[component.group_id]
            const componentStatus = COMPONENT_STATUS_LABEL[component.status]

            // filter out components that don't belong to our groups of interest
            if (
                !groupName ||
                [
                    ComponentStatus.Operational,
                    ComponentStatus.DegradedPerformance,
                ].includes(component.status)
            ) {
                continue
            }

            // filter out affected integration components that are not active for this account
            const affectedIntegrationType =
                INTEGRATION_COMPONENTS_TYPES[component.id]
            if (
                affectedIntegrationType &&
                !activeIntegrationsTypes.includes(affectedIntegrationType)
            ) {
                continue
            }

            // Find the highest status (Ex: major outage) and use it for display.
            // Ex: if we have a 'major outage' and a simultaneous 'partial outage' incident only show
            // 'major outage' since it's more important.
            if (componentStatus.level >= notification.level) {
                notification.level = componentStatus.level
                notification.status = componentStatus.status
                notification.label = componentStatus.label
                // if there are mixed incident levels we could combine the groups/names here - this can lead to some
                // confusion, but it can be resolved by looking at the status page incident itself.
                notification.groupNames.add(groupName)
                // we have a lot of components -> only show a couple
                if (notification.componentNames.size < 5) {
                    notification.componentNames.add(component.name)
                }
            }
        }

        if (notification.level > 0) {
            this.store.dispatch(
                notify({
                    id: COMPONENTS_NOTIFICATION_ID,
                    status: notification.status,
                    style: 'banner',
                    message: `
Currently experiencing ${notification.label} in our ${Array.from(
                        notification.groupNames
                    ).join(' & ')} affecting
${Array.from(notification.componentNames).join(', ')} components.
Find out more on our <u><a href="${
                        data.page.url
                    }" target="_blank" rel="noreferrer noopener">status page</a></u>.`,
                    allowHTML: true,
                    dismissible: false,
                    closable: true,
                } as any) as any
            )
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
