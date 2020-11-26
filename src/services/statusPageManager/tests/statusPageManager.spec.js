import {removeNotification} from 'reapop'
import moment from 'moment'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import statusPageManager from '../statusPageManager.ts'
import {
    HELPDESK_GROUP_IDS,
    MAINTENANCE_STATUSES,
    INCIDENTS_NOTIFICATION_ID,
    MAINTENANCE_NOTIFICATION_ID,
    CLUSTER_GROUP_ID,
} from '../constants.ts'
import {ComponentStatus, IncidentImpact} from '../types.ts'

import {notify} from '../../../state/notifications/actions.ts'

import {
    FACEBOOK_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE,
} from '../../../constants/integration.ts'

const mockStore = configureMockStore([thunk])

jest.mock('../../../state/notifications/actions.ts', () => {
    const notificationActions = jest.requireActual(
        '../../../state/notifications/actions.ts'
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
        removeNotification: jest.fn(reapop.removeNotification),
    }
})

describe('statusPageManager', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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

            expect(removeNotification).toHaveBeenCalledTimes(1)
            expect(removeNotification).toBeCalledWith(
                `${INCIDENTS_NOTIFICATION_ID}-incident-id`
            )
        })

        it.each(Object.values(IncidentImpact))(
            'should dispatch notify accordingly with %s impact',
            (impact) => {
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
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
                                },
                                {
                                    name: 'GraphQL API',
                                    status: ComponentStatus.PartialOutage,
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
                                },
                                {
                                    name:
                                        'Operational components should be ignore',
                                    status: ComponentStatus.Operational,
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
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
            }
        )

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
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
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
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
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
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
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
            it('should notify if matches an active integration', () => {
                statusPageManager.store = mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 1,
                                type: FACEBOOK_INTEGRATION_TYPE,
                                deactivated_datetime: null,
                            },
                        ],
                    }),
                })
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
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
                                },
                            ],
                        },
                    ],
                })
                expect(notify.mock.calls).toMatchSnapshot()
            })

            it('should not notify if matches an inactive integration', () => {
                statusPageManager.store = mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 1,
                                type: FACEBOOK_INTEGRATION_TYPE,
                                deactivated_datetime: '2020-01-01',
                            },
                        ],
                    }),
                })
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
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
                                },
                            ],
                        },
                    ],
                })
                expect(notify).not.toHaveBeenCalled()
            })

            it('should not notify if integration type does not match', () => {
                statusPageManager.store = mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 1,
                                type: GMAIL_INTEGRATION_TYPE,
                                deactivated_datetime: null,
                            },
                        ],
                    }),
                })
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
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
                                },
                            ],
                        },
                    ],
                })
                expect(notify).not.toHaveBeenCalled()
            })

            it('should notify active integrations and filter out inactive ones', () => {
                statusPageManager.store = mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 1,
                                type: GMAIL_INTEGRATION_TYPE,
                                deactivated_datetime: null,
                            },
                            {
                                id: 1,
                                type: FACEBOOK_INTEGRATION_TYPE,
                                deactivated_datetime: '2020-01-01',
                            },
                        ],
                    }),
                })
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
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
                                },
                                {
                                    id: 'wfkm6njpgc6p',
                                    name: 'Gmail Integration',
                                    status: ComponentStatus.MajorOutage,
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
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
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
                                },
                                {
                                    name: 'GraphQL API',
                                    status: status,
                                    group_id: Object.keys(
                                        HELPDESK_GROUP_IDS
                                    )[0],
                                },
                            ],
                        },
                    ],
                })
                expect(removeNotification).toHaveBeenCalledTimes(1)
                expect(removeNotification).toBeCalledWith(
                    MAINTENANCE_NOTIFICATION_ID
                )
                expect(notify.mock.calls).toMatchSnapshot()
            }
        )
    })
})
