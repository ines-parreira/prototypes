import {removeNotification} from 'reapop'
import moment from 'moment'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import statusPageManager from '../statusPageManager.ts'
import {
    HELPDESK_GROUP_IDS,
    COMPONENT_STATUSES,
    MAINTENANCE_STATUSES,
    COMPONENTS_NOTIFICATION_ID,
    MAINTENANCE_NOTIFICATION_ID,
    CLUSTER_GROUP_ID,
} from '../constants.ts'

import {notify} from '../../../state/notifications/actions.ts'

import {
    FACEBOOK_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE,
} from '../../../constants/integration.ts'

const mockStore = configureMockStore([thunk])

jest.mock('../../../state/notifications/actions.ts', () => {
    const notificationActions = require.requireActual(
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

    describe('processComponents()', () => {
        it.each([null, {}, {invalid: 'data'}])(
            'should throw an error if data is `%s`',
            (data) => {
                expect(() => {
                    statusPageManager.processComponents(data)
                }).toThrow()
            }
        )

        it.each([
            COMPONENT_STATUSES.DEGRADED_PERFORMANCE,
            COMPONENT_STATUSES.PARTIAL_OUTAGE,
            COMPONENT_STATUSES.MAJOR_OUTAGE,
        ])('should dispatch notify with %s status', (status) => {
            statusPageManager.processComponents({
                page: {
                    url: 'https://status.gorgias.com/',
                },
                components: [
                    {
                        name: 'REST API',
                        status: status,
                        group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                    },
                    {
                        name: 'GraphQL API',
                        status: status,
                        group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                    },
                    {
                        name: 'Operational components should be ignore',
                        status: 'operational',
                        group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                    },
                    {
                        name: 'ignored component',
                        status: status,
                        group_id: 'unknown',
                    },
                ],
            })
            expect(removeNotification).toHaveBeenCalledTimes(1)
            expect(removeNotification).toBeCalledWith(
                COMPONENTS_NOTIFICATION_ID
            )
            expect(notify.mock.calls).toMatchSnapshot()
        })

        it('should dispatch notification with the highest error level', () => {
            statusPageManager.processComponents({
                page: {
                    url: 'https://status.gorgias.com/',
                },
                components: [
                    {
                        name: 'REST API',
                        status: COMPONENT_STATUSES.DEGRADED_PERFORMANCE,
                        group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                    },
                    {
                        name: 'GraphQL API',
                        status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                        group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                    },
                ],
            })
            expect(notify.mock.calls).toMatchSnapshot()
        })

        describe('cluster filtering', () => {
            it('should not notify if cluster not matched', () => {
                const clusterName = 'us-east1-abc'
                window.GORGIAS_CLUSTER = 'us-east4-123'

                statusPageManager.processComponents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    components: [
                        {
                            name: 'REST API',
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                        },
                        {
                            name: clusterName,
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: CLUSTER_GROUP_ID,
                        },
                    ],
                })
                expect(notify.mock.calls).toMatchSnapshot()
            })

            it('should notify if matches the cluster', () => {
                const clusterName = 'us-east1-abc'
                window.GORGIAS_CLUSTER = clusterName

                statusPageManager.processComponents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    components: [
                        {
                            name: 'REST API',
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                        },
                        {
                            name: clusterName,
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: CLUSTER_GROUP_ID,
                        },
                    ],
                })
                expect(notify.mock.calls).toMatchSnapshot()
            })

            it('should notify if matches the second cluster', () => {
                const clusterName = 'us-east1-abc'
                statusPageManager.cluster = clusterName

                statusPageManager.processComponents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    components: [
                        {
                            name: 'REST API',
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                        },
                        {
                            name: 'us-random-cluster',
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: CLUSTER_GROUP_ID,
                        },
                        {
                            name: clusterName,
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: CLUSTER_GROUP_ID,
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
                statusPageManager.processComponents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    components: [
                        {
                            id: '72gh1dxg7hnv',
                            name: 'Facebook Integration',
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
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
                statusPageManager.processComponents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    components: [
                        {
                            id: '72gh1dxg7hnv',
                            name: 'Facebook Integration',
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                        },
                    ],
                })
                expect(notify.mock.calls).toMatchSnapshot()
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
                statusPageManager.processComponents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    components: [
                        {
                            id: '72gh1dxg7hnv',
                            name: 'Facebook Integration',
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                        },
                    ],
                })
                expect(notify.mock.calls).toMatchSnapshot()
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
                statusPageManager.processComponents({
                    page: {
                        url: 'https://status.gorgias.com/',
                    },
                    components: [
                        {
                            id: '72gh1dxg7hnv',
                            name: 'Facebook Integration',
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                        },
                        {
                            id: 'wfkm6njpgc6p',
                            name: 'Gmail Integration',
                            status: COMPONENT_STATUSES.MAJOR_OUTAGE,
                            group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
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
            'should dispatch notify with %s status',
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
