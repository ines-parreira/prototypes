import { fromJS } from 'immutable'
import type { Map as ImmutableMap } from 'immutable'
import moment from 'moment'

import {
    MAGENTO2_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import { TAGS_ADDED_KEY, TAGS_REMOVED_KEY } from 'models/event/constants'
import { TICKET_EVENT_TYPES } from 'models/event/types'

import {
    deduplicateAuditLogEvents,
    getAllCustomerIdsFromTicket,
    shouldDeduplicateAuditLogEvents,
} from '../helpers'

describe('ticket helpers', () => {
    describe('shouldDeduplicateAuditLogEvents()', () => {
        it('should return `True` because the given date is too old', () => {
            expect(
                shouldDeduplicateAuditLogEvents('2019-12-10T00:00:00Z'),
            ).toBe(true)
        })

        it('should return `False` because the given date is not too old', () => {
            expect(
                shouldDeduplicateAuditLogEvents('2019-12-10T02:00:00Z'),
            ).toBe(false)
        })
    })

    describe('deduplicateAuditLogEvents()', () => {
        describe('should deduplicate events of type', () => {
            it(TICKET_EVENT_TYPES.TicketAssigned, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketAssigned,
                        data: { assignee_user_id: 1 },
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketAssigned,
                        data: { assignee_user_id: 1 },
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketAssigned,
                        data: { assignee_user_id: 1 },
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketClosed, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketClosed,
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketClosed,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketClosed,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketCreated, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketCreated,
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketCreated,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketCreated,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketMarkedSpam, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketMarkedSpam,
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketMarkedSpam,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketMarkedSpam,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketReopened, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketReopened,
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketReopened,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketReopened,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketSnoozed, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketSnoozed,
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketSnoozed,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketSnoozed,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketTagsAdded, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketTagsAdded,
                        data: { [TAGS_ADDED_KEY]: [1] },
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketTagsAdded,
                        data: { [TAGS_ADDED_KEY]: [1] },
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketTagsAdded,
                        data: { [TAGS_ADDED_KEY]: [1] },
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketTagsRemoved, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketTagsAdded,
                        data: { [TAGS_ADDED_KEY]: [1] },
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketTagsRemoved,
                        data: { [TAGS_REMOVED_KEY]: [1] },
                    },
                    {
                        created_datetime: 2,
                        type: TICKET_EVENT_TYPES.TicketTagsRemoved,
                        data: { [TAGS_REMOVED_KEY]: [1] },
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketTagsAdded,
                        data: { [TAGS_ADDED_KEY]: [1] },
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketTagsRemoved,
                        data: { [TAGS_REMOVED_KEY]: [1] },
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketTeamAssigned, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                        data: { assignee_team_id: 1 },
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                        data: { assignee_team_id: 1 },
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                        data: { assignee_team_id: 1 },
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketTeamUnassigned, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                        data: { assignee_team_id: 1 },
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketTeamUnassigned,
                    },
                    {
                        created_datetime: 2,
                        type: TICKET_EVENT_TYPES.TicketTeamUnassigned,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                        data: { assignee_team_id: 1 },
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketTeamUnassigned,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketTrashed, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketTrashed,
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketTrashed,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketTrashed,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketUnassigned, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketAssigned,
                        data: { assignee_user_id: 1 },
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketUnassigned,
                    },
                    {
                        created_datetime: 2,
                        type: TICKET_EVENT_TYPES.TicketUnassigned,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketAssigned,
                        data: { assignee_user_id: 1 },
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketUnassigned,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketUnmarkedSpam, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketUnmarkedSpam,
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketUnmarkedSpam,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketUnmarkedSpam,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TICKET_EVENT_TYPES.TicketUntrashed, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketUntrashed,
                    },
                    {
                        created_datetime: 1,
                        type: TICKET_EVENT_TYPES.TicketUntrashed,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TICKET_EVENT_TYPES.TicketUntrashed,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })
        })

        describe('should keep two events of type', () => {
            describe(TICKET_EVENT_TYPES.TicketAssigned, () => {
                it('because ticket is assigned to someone else', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketAssigned,
                            data: { assignee_user_id: 1 },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketAssigned,
                            data: { assignee_user_id: 2 },
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because ticket is unassigned and re-assigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketAssigned,
                            data: { assignee_user_id: 1 },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketUnassigned,
                        },
                        {
                            created_datetime: 2,
                            type: TICKET_EVENT_TYPES.TicketAssigned,
                            data: { assignee_user_id: 1 },
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketClosed, () => {
                it('because ticket is re-opened and closed again', () => {
                    const events = fromJS([
                        {
                            type: TICKET_EVENT_TYPES.TicketClosed,
                            created_datetime: 0,
                        },
                        {
                            type: TICKET_EVENT_TYPES.TicketReopened,
                            created_datetime: 1,
                        },
                        {
                            type: TICKET_EVENT_TYPES.TicketClosed,
                            created_datetime: 2,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketMarkedSpam, () => {
                it('because ticket is unmarked as spam and marked again', () => {
                    const events = fromJS([
                        {
                            type: TICKET_EVENT_TYPES.TicketMarkedSpam,
                            created_datetime: 0,
                        },
                        {
                            type: TICKET_EVENT_TYPES.TicketUnmarkedSpam,
                            created_datetime: 1,
                        },
                        {
                            type: TICKET_EVENT_TYPES.TicketMarkedSpam,
                            created_datetime: 2,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketReopened, () => {
                it('because ticket is closed and reopened again', () => {
                    const events = fromJS([
                        {
                            type: TICKET_EVENT_TYPES.TicketReopened,
                            created_datetime: 0,
                        },
                        {
                            type: TICKET_EVENT_TYPES.TicketClosed,
                            created_datetime: 1,
                        },
                        {
                            type: TICKET_EVENT_TYPES.TicketReopened,
                            created_datetime: 2,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketSnoozed, () => {
                it('because ticket is snoozed a second time, more than 5 seconds after the first time', () => {
                    const events = fromJS([
                        {
                            type: TICKET_EVENT_TYPES.TicketSnoozed,
                            created_datetime: moment(0).valueOf(),
                        },
                        {
                            type: TICKET_EVENT_TYPES.TicketSnoozed,
                            created_datetime: moment(0)
                                .add(6, 'seconds')
                                .valueOf(),
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketTagsAdded, () => {
                it('because added tags are different', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketTagsAdded,
                            data: { [TAGS_ADDED_KEY]: [1] },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketTagsAdded,
                            data: { [TAGS_ADDED_KEY]: [2] },
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because added tags in second event contain some new tags', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketTagsAdded,
                            data: { [TAGS_ADDED_KEY]: [1] },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketTagsAdded,
                            data: { [TAGS_ADDED_KEY]: [1, 2] },
                        },
                    ])

                    const expected = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketTagsAdded,
                            data: { [TAGS_ADDED_KEY]: [1] },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketTagsAdded,
                            data: { [TAGS_ADDED_KEY]: [2] },
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(expected)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketTagsRemoved, () => {
                it('because removed tags are different', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketTagsAdded,
                            data: { [TAGS_ADDED_KEY]: [1, 2] },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketTagsRemoved,
                            data: { [TAGS_REMOVED_KEY]: [1] },
                        },
                        {
                            created_datetime: 2,
                            type: TICKET_EVENT_TYPES.TicketTagsRemoved,
                            data: { [TAGS_REMOVED_KEY]: [2] },
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because removed tags in second event contain some new tags', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketTagsAdded,
                            data: { [TAGS_ADDED_KEY]: [1, 2] },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketTagsRemoved,
                            data: { [TAGS_REMOVED_KEY]: [1] },
                        },
                        {
                            created_datetime: 2,
                            type: TICKET_EVENT_TYPES.TicketTagsRemoved,
                            data: { [TAGS_REMOVED_KEY]: [1, 2] },
                        },
                    ])

                    const expected = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketTagsAdded,
                            data: { [TAGS_ADDED_KEY]: [1, 2] },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketTagsRemoved,
                            data: { [TAGS_REMOVED_KEY]: [1] },
                        },
                        {
                            created_datetime: 2,
                            type: TICKET_EVENT_TYPES.TicketTagsRemoved,
                            data: { [TAGS_REMOVED_KEY]: [2] },
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(expected)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketTeamAssigned, () => {
                it('because ticket is assigned to someone else', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                            data: { assignee_team_id: 1 },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                            data: { assignee_team_id: 2 },
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because ticket is unassigned and re-assigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                            data: { assignee_team_id: 1 },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketTeamUnassigned,
                        },
                        {
                            created_datetime: 2,
                            type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                            data: { assignee_team_id: 1 },
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketTeamUnassigned, () => {
                it('because ticket is assigned and re-unassigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                            data: { assignee_team_id: 1 },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketTeamUnassigned,
                        },
                        {
                            created_datetime: 2,
                            type: TICKET_EVENT_TYPES.TicketTeamAssigned,
                            data: { assignee_team_id: 1 },
                        },
                        {
                            created_datetime: 3,
                            type: TICKET_EVENT_TYPES.TicketTeamUnassigned,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketTrashed, () => {
                it('because ticket is untrashed and re-trashed', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketTrashed,
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketUntrashed,
                        },
                        {
                            created_datetime: 2,
                            type: TICKET_EVENT_TYPES.TicketTrashed,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketUnassigned, () => {
                it('because ticket is assigned and re-unassigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketAssigned,
                            data: { assignee_user_id: 1 },
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketUnassigned,
                        },
                        {
                            created_datetime: 2,
                            type: TICKET_EVENT_TYPES.TicketAssigned,
                            data: { assignee_user_id: 1 },
                        },
                        {
                            created_datetime: 3,
                            type: TICKET_EVENT_TYPES.TicketUnassigned,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketUnmarkedSpam, () => {
                it('because ticket is marked as spam and re-unmarked', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketUnmarkedSpam,
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketMarkedSpam,
                        },
                        {
                            created_datetime: 2,
                            type: TICKET_EVENT_TYPES.TicketUnmarkedSpam,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.TicketUntrashed, () => {
                it('because ticket is trashed and re-untrashed', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.TicketUntrashed,
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.TicketTrashed,
                        },
                        {
                            created_datetime: 2,
                            type: TICKET_EVENT_TYPES.TicketUntrashed,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TICKET_EVENT_TYPES.RuleExecuted, () => {
                it('because it should never get deduplicated', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TICKET_EVENT_TYPES.RuleExecuted,
                        },
                        {
                            created_datetime: 1,
                            type: TICKET_EVENT_TYPES.RuleExecuted,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })
        })
    })

    describe('getAllCustomerIdsFromTicket()', () => {
        const shop_integration_1 = {
            42: {
                customer: {
                    id: 142,
                },
                __integration_type__: SHOPIFY_INTEGRATION_TYPE,
            },
        }

        const shop_integration_2 = {
            43: {
                customer: {
                    id: 143,
                },
                __integration_type__: MAGENTO2_INTEGRATION_TYPE,
            },
        }

        const shop_integration_3 = {
            44: {
                customer: {
                    id: 144,
                },
                __integration_type__: SHOPIFY_INTEGRATION_TYPE,
            },
        }

        it('should return structure with empty values on empty ticket', () => {
            const ticket = fromJS({})
            expect(getAllCustomerIdsFromTicket(ticket)).toEqual({
                gorgias_id: null,
                integrations: [],
            })
        })

        it('should return all customer ids', () => {
            const ticket = fromJS({
                customer: {
                    id: 1,
                    integrations: {
                        ...shop_integration_1,
                        ...shop_integration_2,
                        ...shop_integration_3,
                    },
                },
            })
            expect(getAllCustomerIdsFromTicket(ticket)).toEqual({
                gorgias_id: 1,
                integrations: [
                    { id: '42', customer_id: 142 },
                    { id: '43', customer_id: 143 },
                    { id: '44', customer_id: 144 },
                ],
            })
        })

        it('should return all customer ids from matching integrations', () => {
            const ticket = fromJS({
                customer: {
                    id: 1,
                    integrations: {
                        ...shop_integration_1,
                        ...shop_integration_2,
                        ...shop_integration_3,
                    },
                },
            })

            const filterFn = (integration: ImmutableMap<any, any>) =>
                integration.get('__integration_type__') ===
                SHOPIFY_INTEGRATION_TYPE

            expect(getAllCustomerIdsFromTicket(ticket, filterFn)).toEqual({
                gorgias_id: 1,
                integrations: [
                    { id: '42', customer_id: 142 },
                    { id: '44', customer_id: 144 },
                ],
            })
        })

        it('should return all customer ids and null for missing ids', () => {
            const ticket = fromJS({
                customer: {
                    id: 1,
                    integrations: {
                        ...shop_integration_1,
                        ...shop_integration_2,
                        45: { customer: { some_key: 'some_val' } },
                    },
                },
            })

            expect(getAllCustomerIdsFromTicket(ticket)).toEqual({
                gorgias_id: 1,
                integrations: [
                    { id: '42', customer_id: 142 },
                    { id: '43', customer_id: 143 },
                    { id: '45', customer_id: null },
                ],
            })
        })
    })
})
