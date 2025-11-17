import { fromJS } from 'immutable'
import moment from 'moment'
import * as reapop from 'reapop'

import { IntegrationType } from 'models/integration/constants'
import * as actions from 'state/notifications/actions'

import {
    CLUSTER_GROUP_ID,
    DISMISSED_MAINTENANCES_LOCAL_STORAGE_KEY,
    DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
    HELPCENTER_GROUP_ID,
    HELPDESK_GROUP_IDS,
    INCIDENTS_NOTIFICATION_ID,
    MAINTENANCE_NOTIFICATION_ID,
    MAINTENANCE_STATUSES,
} from '../constants'
import statusPageManager from '../statusPageManager'
import type {
    StatusPageIncidentsResponseData,
    StatusPageScheduledMaintenanceResponseData,
} from '../types'
import { ComponentStatus, IncidentImpact } from '../types'

const notifySpy = jest.spyOn(actions, 'notify')
const dismissNotificationSpy = jest.spyOn(reapop, 'dismissNotification')

describe('statusPageManager', () => {
    afterEach(() => {
        localStorage.clear()
    })

    describe('processIncidents()', () => {
        it.each([null, {}, { invalid: 'data' }])(
            'should throw an error if data is `%s`',
            (data) => {
                expect(() => {
                    statusPageManager.processIncidents(
                        data as StatusPageIncidentsResponseData,
                    )
                }).toThrow()
            },
        )

        it('should remove notification of previous incident', () => {
            const id = 'incident-id'
            const args = {
                page: {
                    url: 'https://status.gorgias.com/',
                },
                incidents: [
                    {
                        id,
                        impact: IncidentImpact.Minor,
                        components: [
                            {
                                name: 'REST API',
                                status: ComponentStatus.MajorOutage,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                            {
                                name: 'GraphQL API',
                                status: ComponentStatus.PartialOutage,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                            {
                                name: 'Operational components should be ignore',
                                status: ComponentStatus.Operational,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                            {
                                name: 'ignored component',
                                status: ComponentStatus.MajorOutage,
                                group_id: 'unknown',
                            },
                        ],
                    },
                ],
            }
            statusPageManager.processIncidents(
                args as StatusPageIncidentsResponseData,
            )
            statusPageManager.processIncidents(
                args as StatusPageIncidentsResponseData,
            )

            expect(dismissNotificationSpy).toHaveBeenCalledTimes(1)
            expect(dismissNotificationSpy).toBeCalledWith(
                `${INCIDENTS_NOTIFICATION_ID}-incident-id`,
            )
        })

        it.each([
            IncidentImpact.None,
            IncidentImpact.Minor,
            IncidentImpact.Major,
            IncidentImpact.Critical,
        ])('should dispatch notify accordingly with %s impact', (impact) => {
            statusPageManager.processIncidents({
                page: {
                    url: 'https://status.gorgias.com/',
                },
                incidents: [
                    {
                        id: 'incident-id',
                        impact,
                        components: [
                            {
                                name: 'REST API',
                                status: ComponentStatus.MajorOutage,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                            {
                                name: 'GraphQL API',
                                status: ComponentStatus.PartialOutage,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                            {
                                name: 'Operational components should be ignore',
                                status: ComponentStatus.Operational,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                            {
                                name: 'ignored component',
                                status: ComponentStatus.MajorOutage,
                                group_id: 'unknown',
                            },
                        ],
                    },
                ],
            } as StatusPageIncidentsResponseData)
            expect(notifySpy.mock.calls).toMatchSnapshot()
        })

        it('should dispatch as many notifications as there are incidents', () => {
            statusPageManager.processIncidents({
                page: {
                    url: 'https://status.gorgias.com/',
                },
                incidents: [
                    {
                        id: 'incident-id-1',
                        impact: IncidentImpact.Minor,
                        components: [
                            {
                                name: 'REST API',
                                status: ComponentStatus.DegradedPerformance,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                            {
                                name: 'GraphQL API',
                                status: ComponentStatus.MajorOutage,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                        ],
                    },
                    {
                        id: 'incident-id-2',
                        impact: IncidentImpact.Critical,
                        components: [
                            {
                                name: 'REST API',
                                status: ComponentStatus.DegradedPerformance,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                            {
                                name: 'GraphQL API',
                                status: ComponentStatus.MajorOutage,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                        ],
                    },
                ],
            } as StatusPageIncidentsResponseData)
            expect(notifySpy.mock.calls).toMatchSnapshot()
        })

        it('should not dispatch notification if its incident id is present in localStorage', () => {
            const id = 'this-is-my-id'
            localStorage.setItem(
                DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
                JSON.stringify([id]),
            )

            statusPageManager.processIncidents({
                page: {
                    url: 'https://status.gorgias.com/',
                },
                incidents: [
                    {
                        id,
                        impact: IncidentImpact.Critical,
                        components: [
                            {
                                name: 'REST API',
                                status: ComponentStatus.MajorOutage,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                            {
                                name: 'GraphQL API',
                                status: ComponentStatus.PartialOutage,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                        ],
                    },
                ],
            } as StatusPageIncidentsResponseData)

            expect(notifySpy).not.toHaveBeenCalled()
        })

        it('should dispatch notification if its incident id is not stored in localStorage', () => {
            const id = 'this-is-another-incident-id'
            localStorage.setItem(
                DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
                JSON.stringify([id]),
            )

            statusPageManager.processIncidents({
                page: {
                    url: 'https://status.gorgias.com/',
                },
                incidents: [
                    {
                        id: 'my-incident-id',
                        impact: IncidentImpact.Critical,
                        components: [
                            {
                                name: 'REST API',
                                status: ComponentStatus.MajorOutage,
                                group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                            },
                        ],
                    },
                ],
            } as StatusPageIncidentsResponseData)

            expect(notifySpy.mock.calls).toMatchSnapshot()
        })

        describe('cluster filtering', () => {
            it('should not notify if cluster is not a match', () => {
                const clusterName = 'us-east1-abc'
                window.GORGIAS_CLUSTER = 'us-east4-123'

                statusPageManager.processIncidents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    incidents: [
                        {
                            id: 'incident-id',
                            impact: IncidentImpact.Major,
                            components: [
                                {
                                    name: 'REST API',
                                    status: ComponentStatus.MajorOutage,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                                {
                                    name: clusterName,
                                    status: ComponentStatus.MajorOutage,
                                    group_id: CLUSTER_GROUP_ID,
                                },
                            ],
                        },
                    ],
                } as StatusPageIncidentsResponseData)
                expect(notifySpy).not.toHaveBeenCalled()
            })

            it('should notify if matches the cluster', () => {
                const clusterName = 'us-east1-abc'
                window.GORGIAS_CLUSTER = clusterName

                statusPageManager.processIncidents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    incidents: [
                        {
                            id: 'incident-id',
                            impact: IncidentImpact.Major,
                            components: [
                                {
                                    name: 'REST API',
                                    status: ComponentStatus.MajorOutage,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                                {
                                    name: clusterName,
                                    status: ComponentStatus.MajorOutage,
                                    group_id: CLUSTER_GROUP_ID,
                                },
                            ],
                        },
                    ],
                } as StatusPageIncidentsResponseData)
                expect(notifySpy.mock.calls).toMatchSnapshot()
            })

            it('should notify if matches the second cluster', () => {
                const clusterName = 'us-east1-abc'
                window.GORGIAS_CLUSTER = clusterName

                statusPageManager.processIncidents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    incidents: [
                        {
                            id: 'incident-id',
                            impact: IncidentImpact.Major,
                            components: [
                                {
                                    name: 'REST API',
                                    status: ComponentStatus.MajorOutage,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                                {
                                    name: 'us-random-cluster',
                                    status: ComponentStatus.MajorOutage,
                                    group_id: CLUSTER_GROUP_ID,
                                },
                                {
                                    name: clusterName,
                                    status: ComponentStatus.MajorOutage,
                                    group_id: CLUSTER_GROUP_ID,
                                },
                            ],
                        },
                    ],
                } as StatusPageIncidentsResponseData)
                expect(notifySpy.mock.calls).toMatchSnapshot()
            })
        })

        describe('integration filtering', () => {
            it('should not notify if integration type does not match', () => {
                ;(
                    statusPageManager as unknown as Record<string, unknown>
                ).activeIntegrationsTypes = fromJS([IntegrationType.Gmail])
                statusPageManager.processIncidents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    incidents: [
                        {
                            id: 'incident-id',
                            impact: IncidentImpact.Major,
                            components: [
                                {
                                    id: '72gh1dxg7hnv',
                                    name: 'Facebook Integration',
                                    status: ComponentStatus.MajorOutage,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                            ],
                        },
                    ],
                } as StatusPageIncidentsResponseData)
                expect(notifySpy).not.toHaveBeenCalled()
            })

            it('should notify active integrations', () => {
                ;(
                    statusPageManager as unknown as Record<string, unknown>
                ).activeIntegrationsTypes = fromJS([
                    IntegrationType.Gmail,
                    IntegrationType.Facebook,
                ])
                statusPageManager.processIncidents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    incidents: [
                        {
                            id: 'incident-id',
                            impact: IncidentImpact.Major,
                            components: [
                                {
                                    id: '72gh1dxg7hnv',
                                    name: 'Facebook Integration',
                                    status: ComponentStatus.MajorOutage,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                                {
                                    id: 'wfkm6njpgc6p',
                                    name: 'Gmail Integration',
                                    status: ComponentStatus.MajorOutage,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                            ],
                        },
                    ],
                } as StatusPageIncidentsResponseData)
                expect(notifySpy.mock.calls).toMatchSnapshot()
            })
        })
    })

    describe('processScheduledMaintenances()', () => {
        it.each([null, {}, { invalid: 'data' }])(
            'should throw an error if data is `%s`',
            (data) => {
                expect(() => {
                    statusPageManager.processScheduledMaintenances(
                        data as StatusPageScheduledMaintenanceResponseData,
                    )
                }).toThrow()
            },
        )

        it.each(Object.values(MAINTENANCE_STATUSES))(
            'should dispatch notify or not according to %s status',
            (status) => {
                statusPageManager.processScheduledMaintenances({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    scheduled_maintenances: [
                        {
                            status: status,
                            scheduled_for: moment().add(2, 'minutes').format(),
                            components: [
                                {
                                    name: 'REST API',
                                    status: status,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                                {
                                    name: 'GraphQL API',
                                    status: status,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                            ],
                        },
                    ],
                } as unknown as StatusPageScheduledMaintenanceResponseData)
                expect(dismissNotificationSpy).toHaveBeenCalledTimes(1)
                expect(dismissNotificationSpy).toBeCalledWith(
                    MAINTENANCE_NOTIFICATION_ID,
                )
                expect(notifySpy.mock.calls).toMatchSnapshot()
            },
        )

        describe('cluster filtering', () => {
            it('should not notify if cluster is not a match', () => {
                const clusterName = 'us-east1-abc'
                window.GORGIAS_CLUSTER = 'us-east4-123'

                statusPageManager.processScheduledMaintenances({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    scheduled_maintenances: [
                        {
                            id: 'incident-id',
                            impact: 'maintenance',
                            components: [
                                {
                                    name: 'REST API',
                                    status: ComponentStatus.Operational,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                                {
                                    name: clusterName,
                                    status: ComponentStatus.Operational,
                                    group_id: CLUSTER_GROUP_ID,
                                },
                            ],
                        },
                    ],
                } as StatusPageScheduledMaintenanceResponseData)
                expect(notifySpy).not.toHaveBeenCalled()
            })

            it('should notify if matches the cluster', () => {
                const clusterName = 'us-east1-abc'
                window.GORGIAS_CLUSTER = clusterName

                statusPageManager.processScheduledMaintenances({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    scheduled_maintenances: [
                        {
                            id: 'incident-id',
                            impact: 'maintenance',
                            components: [
                                {
                                    name: 'REST API',
                                    status: ComponentStatus.Operational,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                                {
                                    name: clusterName,
                                    status: ComponentStatus.Operational,
                                    group_id: CLUSTER_GROUP_ID,
                                },
                            ],
                        },
                    ],
                } as StatusPageScheduledMaintenanceResponseData)
                expect(notifySpy.mock.calls).toMatchSnapshot()
            })

            it('should notify if matches the second cluster', () => {
                const clusterName = 'us-east1-abc'
                window.GORGIAS_CLUSTER = clusterName

                statusPageManager.processScheduledMaintenances({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    scheduled_maintenances: [
                        {
                            id: 'incident-id',
                            impact: 'maintenance',
                            components: [
                                {
                                    name: 'REST API',
                                    status: ComponentStatus.Operational,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                                {
                                    name: 'us-random-cluster',
                                    status: ComponentStatus.Operational,
                                    group_id: CLUSTER_GROUP_ID,
                                },
                                {
                                    name: clusterName,
                                    status: ComponentStatus.Operational,
                                    group_id: CLUSTER_GROUP_ID,
                                },
                            ],
                        },
                    ],
                } as StatusPageScheduledMaintenanceResponseData)
                expect(notifySpy.mock.calls).toMatchSnapshot()
            })

            it('should redisplay banner for a hidden maintenance once it is in progress', () => {
                const clusterName = 'us-east1-abc'
                window.GORGIAS_CLUSTER = clusterName
                const id = 'id-of-banner'

                localStorage.setItem(
                    DISMISSED_MAINTENANCES_LOCAL_STORAGE_KEY,
                    JSON.stringify([id]),
                )

                statusPageManager.processScheduledMaintenances({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    scheduled_maintenances: [
                        {
                            id,
                            impact: 'maintenance',
                            status: 'in_progress',
                            components: [
                                {
                                    name: 'REST API',
                                    status: ComponentStatus.Operational,
                                    group_id:
                                        Object.keys(HELPDESK_GROUP_IDS)[0],
                                },
                                {
                                    name: clusterName,
                                    status: ComponentStatus.Operational,
                                    group_id: CLUSTER_GROUP_ID,
                                },
                            ],
                        },
                    ],
                } as StatusPageScheduledMaintenanceResponseData)
                expect(notifySpy.mock.calls).toMatchSnapshot()
            })
        })
    })

    describe('help center filtering', () => {
        it('should not notify if help center is not installed', () => {
            const clusterName = 'us-east1-abc'
            window.GORGIAS_CLUSTER = 'us-east1-abc'

            statusPageManager.processIncidents({
                page: {
                    url: 'https://status.gorgias.com/',
                },
                incidents: [
                    {
                        id: 'incident-id',
                        impact: IncidentImpact.Major,
                        components: [
                            {
                                name: 'Customer Help Center website',
                                status: ComponentStatus.MajorOutage,
                                group_id: HELPCENTER_GROUP_ID,
                            },
                            {
                                name: clusterName,
                                status: ComponentStatus.MajorOutage,
                                group_id: CLUSTER_GROUP_ID,
                            },
                        ],
                    },
                ],
            } as StatusPageIncidentsResponseData)
            expect(notifySpy).not.toHaveBeenCalled()
        })
    })
})
