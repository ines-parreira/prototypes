import {removeNotification} from 'reapop'
import moment from 'moment'

import statusPageManager from '../statusPageManager'
import {
    HELPDESK_GROUP_IDS,
    COMPONENT_STATUSES,
    MAINTENANCE_STATUSES,
    COMPONENTS_NOTIFICATION_ID,
    MAINTENANCE_NOTIFICATION_ID,
} from '../constants'
import {notify} from '../../../state/notifications/actions'

jest.mock('../../../state/notifications/actions', () => {
    const notificationActions = require.requireActual(
        '../../../state/notifications/actions'
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
                        status: 'degraded_performance',
                        group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                    },
                    {
                        name: 'GraphQL API',
                        status: 'major_outage',
                        group_id: Object.keys(HELPDESK_GROUP_IDS)[0],
                    },
                ],
            })
            expect(notify.mock.calls).toMatchSnapshot()
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
