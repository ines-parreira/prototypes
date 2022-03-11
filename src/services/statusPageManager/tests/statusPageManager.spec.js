import {dismissNotification} from 'reapop'
import moment from 'moment'
import {fromJS} from 'immutable'

import statusPageManager from '../statusPageManager.ts'
import {
    HELPDESK_GROUP_IDS,
    MAINTENANCE_STATUSES,
    INCIDENTS_NOTIFICATION_ID,
    MAINTENANCE_NOTIFICATION_ID,
    CLUSTER_GROUP_ID,
    DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
    DISMISSED_MAINTENANCES_LOCAL_STORAGE_KEY,
} from '../constants.ts'
import {ComponentStatus, IncidentImpact} from '../types.ts'

import {notify} from 'state/notifications/actions.ts'
import {IntegrationType} from 'models/integration/constants.ts'

jest.mock('state/notifications/actions.ts', () => {
    const notificationActions = jest.requireActual(
        'state/notifications/actions.ts'
    )

    return {
        ...notificationActions,
        notify: jest.fn(notificationActions.notify),
    }
})

jest.mock('reapop', () => {
    const reapop = jest.requireActual('reapop')

    return {
        ...reapop,
        dismissNotification: jest.fn(reapop.dismissNotification),
    }
})

describe('statusPageManager', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        localStorage.clear()
    })

    describe('processIncidents()', () => {
        it.each([null, {}, {invalid: 'data'}])(
            'should throw an error if data is `%s`',
            (data) => {
                expect(() => {
                    statusPageManager.processIncidents(data)
                }).toThrow()
            }
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
            statusPageManager.processIncidents(args)
            statusPageManager.processIncidents(args)

            expect(dismissNotification).toHaveBeenCalledTimes(1)
            expect(dismissNotification).toBeCalledWith(
                `${INCIDENTS_NOTIFICATION_ID}-incident-id`
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
            })
            expect(notify.mock.calls).toMatchSnapshot()
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
            })
            expect(notify.mock.calls).toMatchSnapshot()
        })

        it('should not dispatch notification if its incident id is present in localStorage', () => {
            const id = 'this-is-my-id'
            localStorage.setItem(
                DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
                JSON.stringify([id])
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
            })

            expect(notify).not.toHaveBeenCalled()
        })

        it('should dispatch notification if its incident id is not stored in localStorage', () => {
            const id = 'this-is-another-incident-id'
            localStorage.setItem(
                DISMISSED_NOTIFICATIONS_LOCAL_STORAGE_KEY,
                JSON.stringify([id])
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
            })

            expect(notify.mock.calls).toMatchSnapshot()
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
                })
                expect(notify).not.toHaveBeenCalled()
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
                })
                expect(notify.mock.calls).toMatchSnapshot()
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
                })
                expect(notify.mock.calls).toMatchSnapshot()
            })
        })

        describe('integration filtering', () => {
            it('should not notify if integration type does not match', () => {
                statusPageManager.activeIntegrationsTypes = fromJS([
                    IntegrationType.Gmail,
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
                            ],
                        },
                    ],
                })
                expect(notify).not.toHaveBeenCalled()
            })

            it('should notify active integrations', () => {
                statusPageManager.activeIntegrationsTypes = fromJS([
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
                })
                expect(notify.mock.calls).toMatchSnapshot()
            })
        })
    })

    describe('processScheduledMaintenances()', () => {
        it.each([null, {}, {invalid: 'data'}])(
            'should throw an error if data is `%s`',
            (data) => {
                expect(() => {
                    statusPageManager.processScheduledMaintenances(data)
                }).toThrow()
            }
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
                })
                expect(dismissNotification).toHaveBeenCalledTimes(1)
                expect(dismissNotification).toBeCalledWith(
                    MAINTENANCE_NOTIFICATION_ID
                )
                expect(notify.mock.calls).toMatchSnapshot()
            }
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
                })
                expect(notify).not.toHaveBeenCalled()
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
                })
                expect(notify.mock.calls).toMatchSnapshot()
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
                })
                expect(notify.mock.calls).toMatchSnapshot()
            })

            it('should redisplay banner for a hidden maintenance once it is in progress', () => {
                const clusterName = 'us-east1-abc'
                window.GORGIAS_CLUSTER = clusterName
                const id = 'id-of-banner'

                localStorage.setItem(
                    DISMISSED_MAINTENANCES_LOCAL_STORAGE_KEY,
                    JSON.stringify([id])
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
                })
                expect(notify.mock.calls).toMatchSnapshot()
            })
        })
    })
})
