import {fromJS} from 'immutable'
import moment from 'moment'

import * as constants from '../../../constants/event.js'
import {
    deduplicateAuditLogEvents,
    shouldDeduplicateAuditLogEvents,
} from '../helpers'
import {TAGS_ADDED_KEY, TAGS_REMOVED_KEY} from '../../../models/event/constants'

describe('ticket helpers', () => {
    describe('shouldDeduplicateAuditLogEvents()', () => {
        it('should return `True` because the given date is too old', () => {
            expect(
                shouldDeduplicateAuditLogEvents('2019-12-10T00:00:00Z')
            ).toBe(true)
        })

        it('should return `False` because the given date is not too old', () => {
            expect(
                shouldDeduplicateAuditLogEvents('2019-12-10T02:00:00Z')
            ).toBe(false)
        })
    })

    describe('deduplicateAuditLogEvents()', () => {
        describe('should deduplicate events of type', () => {
            it(constants.TICKET_ASSIGNED, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_ASSIGNED,
                        data: {assignee_user_id: 1},
                    },
                    {
                        created_datetime: 1,
                        type: constants.TICKET_ASSIGNED,
                        data: {assignee_user_id: 1},
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_ASSIGNED,
                        data: {assignee_user_id: 1},
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_CLOSED, () => {
                const events = fromJS([
                    {created_datetime: 0, type: constants.TICKET_CLOSED},
                    {created_datetime: 1, type: constants.TICKET_CLOSED},
                ])

                const expected = fromJS([
                    {created_datetime: 0, type: constants.TICKET_CLOSED},
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_CREATED, () => {
                const events = fromJS([
                    {created_datetime: 0, type: constants.TICKET_CREATED},
                    {created_datetime: 1, type: constants.TICKET_CREATED},
                ])

                const expected = fromJS([
                    {created_datetime: 0, type: constants.TICKET_CREATED},
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_MARKED_SPAM, () => {
                const events = fromJS([
                    {created_datetime: 0, type: constants.TICKET_MARKED_SPAM},
                    {created_datetime: 1, type: constants.TICKET_MARKED_SPAM},
                ])

                const expected = fromJS([
                    {created_datetime: 0, type: constants.TICKET_MARKED_SPAM},
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_REOPENED, () => {
                const events = fromJS([
                    {created_datetime: 0, type: constants.TICKET_REOPENED},
                    {created_datetime: 1, type: constants.TICKET_REOPENED},
                ])

                const expected = fromJS([
                    {created_datetime: 0, type: constants.TICKET_REOPENED},
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_SNOOZED, () => {
                const events = fromJS([
                    {created_datetime: 0, type: constants.TICKET_SNOOZED},
                    {created_datetime: 1, type: constants.TICKET_SNOOZED},
                ])

                const expected = fromJS([
                    {created_datetime: 0, type: constants.TICKET_SNOOZED},
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_TAGS_ADDED, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_TAGS_ADDED,
                        data: {[TAGS_ADDED_KEY]: [1]},
                    },
                    {
                        created_datetime: 1,
                        type: constants.TICKET_TAGS_ADDED,
                        data: {[TAGS_ADDED_KEY]: [1]},
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_TAGS_ADDED,
                        data: {[TAGS_ADDED_KEY]: [1]},
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_TAGS_REMOVED, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_TAGS_ADDED,
                        data: {[TAGS_ADDED_KEY]: [1]},
                    },
                    {
                        created_datetime: 1,
                        type: constants.TICKET_TAGS_REMOVED,
                        data: {[TAGS_REMOVED_KEY]: [1]},
                    },
                    {
                        created_datetime: 2,
                        type: constants.TICKET_TAGS_REMOVED,
                        data: {[TAGS_REMOVED_KEY]: [1]},
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_TAGS_ADDED,
                        data: {[TAGS_ADDED_KEY]: [1]},
                    },
                    {
                        created_datetime: 1,
                        type: constants.TICKET_TAGS_REMOVED,
                        data: {[TAGS_REMOVED_KEY]: [1]},
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_TEAM_ASSIGNED, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_TEAM_ASSIGNED,
                        data: {assignee_team_id: 1},
                    },
                    {
                        created_datetime: 1,
                        type: constants.TICKET_TEAM_ASSIGNED,
                        data: {assignee_team_id: 1},
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_TEAM_ASSIGNED,
                        data: {assignee_team_id: 1},
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_TEAM_UNASSIGNED, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_TEAM_ASSIGNED,
                        data: {assignee_team_id: 1},
                    },
                    {
                        created_datetime: 1,
                        type: constants.TICKET_TEAM_UNASSIGNED,
                    },
                    {
                        created_datetime: 2,
                        type: constants.TICKET_TEAM_UNASSIGNED,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_TEAM_ASSIGNED,
                        data: {assignee_team_id: 1},
                    },
                    {
                        created_datetime: 1,
                        type: constants.TICKET_TEAM_UNASSIGNED,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_TRASHED, () => {
                const events = fromJS([
                    {created_datetime: 0, type: constants.TICKET_TRASHED},
                    {created_datetime: 1, type: constants.TICKET_TRASHED},
                ])

                const expected = fromJS([
                    {created_datetime: 0, type: constants.TICKET_TRASHED},
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_UNASSIGNED, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_ASSIGNED,
                        data: {assignee_user_id: 1},
                    },
                    {created_datetime: 1, type: constants.TICKET_UNASSIGNED},
                    {created_datetime: 2, type: constants.TICKET_UNASSIGNED},
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: constants.TICKET_ASSIGNED,
                        data: {assignee_user_id: 1},
                    },
                    {created_datetime: 1, type: constants.TICKET_UNASSIGNED},
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_UNMARKED_SPAM, () => {
                const events = fromJS([
                    {created_datetime: 0, type: constants.TICKET_UNMARKED_SPAM},
                    {created_datetime: 1, type: constants.TICKET_UNMARKED_SPAM},
                ])

                const expected = fromJS([
                    {created_datetime: 0, type: constants.TICKET_UNMARKED_SPAM},
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(constants.TICKET_UNTRASHED, () => {
                const events = fromJS([
                    {created_datetime: 0, type: constants.TICKET_UNTRASHED},
                    {created_datetime: 1, type: constants.TICKET_UNTRASHED},
                ])

                const expected = fromJS([
                    {created_datetime: 0, type: constants.TICKET_UNTRASHED},
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })
        })

        describe('should keep two events of type', () => {
            describe(constants.TICKET_ASSIGNED, () => {
                it('because ticket is assigned to someone else', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_ASSIGNED,
                            data: {assignee_user_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_ASSIGNED,
                            data: {assignee_user_id: 2},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because ticket is unassigned and re-assigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_ASSIGNED,
                            data: {assignee_user_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_UNASSIGNED,
                        },
                        {
                            created_datetime: 2,
                            type: constants.TICKET_ASSIGNED,
                            data: {assignee_user_id: 1},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.TICKET_CLOSED, () => {
                it('because ticket is re-opened and closed again', () => {
                    const events = fromJS([
                        {type: constants.TICKET_CLOSED, created_datetime: 0},
                        {type: constants.TICKET_REOPENED, created_datetime: 1},
                        {type: constants.TICKET_CLOSED, created_datetime: 2},
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.TICKET_MARKED_SPAM, () => {
                it('because ticket is unmarked as spam and marked again', () => {
                    const events = fromJS([
                        {
                            type: constants.TICKET_MARKED_SPAM,
                            created_datetime: 0,
                        },
                        {
                            type: constants.TICKET_UNMARKED_SPAM,
                            created_datetime: 1,
                        },
                        {
                            type: constants.TICKET_MARKED_SPAM,
                            created_datetime: 2,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.TICKET_REOPENED, () => {
                it('because ticket is closed and reopened again', () => {
                    const events = fromJS([
                        {type: constants.TICKET_REOPENED, created_datetime: 0},
                        {type: constants.TICKET_CLOSED, created_datetime: 1},
                        {type: constants.TICKET_REOPENED, created_datetime: 2},
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.TICKET_SNOOZED, () => {
                it('because ticket is snoozed a second time, more than 5 seconds after the first time', () => {
                    const events = fromJS([
                        {
                            type: constants.TICKET_SNOOZED,
                            created_datetime: moment(0).valueOf(),
                        },
                        {
                            type: constants.TICKET_SNOOZED,
                            created_datetime: moment(0)
                                .add(6, 'seconds')
                                .valueOf(),
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.TICKET_TAGS_ADDED, () => {
                it('because added tags are different', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_TAGS_ADDED,
                            data: {[TAGS_ADDED_KEY]: [1]},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_TAGS_ADDED,
                            data: {[TAGS_ADDED_KEY]: [2]},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because added tags in second event contain some new tags', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_TAGS_ADDED,
                            data: {[TAGS_ADDED_KEY]: [1]},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_TAGS_ADDED,
                            data: {[TAGS_ADDED_KEY]: [1, 2]},
                        },
                    ])

                    const expected = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_TAGS_ADDED,
                            data: {[TAGS_ADDED_KEY]: [1]},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_TAGS_ADDED,
                            data: {[TAGS_ADDED_KEY]: [2]},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(expected)
                })
            })

            describe(constants.TICKET_TAGS_REMOVED, () => {
                it('because removed tags are different', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_TAGS_ADDED,
                            data: {[TAGS_ADDED_KEY]: [1, 2]},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_TAGS_REMOVED,
                            data: {[TAGS_REMOVED_KEY]: [1]},
                        },
                        {
                            created_datetime: 2,
                            type: constants.TICKET_TAGS_REMOVED,
                            data: {[TAGS_REMOVED_KEY]: [2]},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because removed tags in second event contain some new tags', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_TAGS_ADDED,
                            data: {[TAGS_ADDED_KEY]: [1, 2]},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_TAGS_REMOVED,
                            data: {[TAGS_REMOVED_KEY]: [1]},
                        },
                        {
                            created_datetime: 2,
                            type: constants.TICKET_TAGS_REMOVED,
                            data: {[TAGS_REMOVED_KEY]: [1, 2]},
                        },
                    ])

                    const expected = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_TAGS_ADDED,
                            data: {[TAGS_ADDED_KEY]: [1, 2]},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_TAGS_REMOVED,
                            data: {[TAGS_REMOVED_KEY]: [1]},
                        },
                        {
                            created_datetime: 2,
                            type: constants.TICKET_TAGS_REMOVED,
                            data: {[TAGS_REMOVED_KEY]: [2]},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(expected)
                })
            })

            describe(constants.TICKET_TEAM_ASSIGNED, () => {
                it('because ticket is assigned to someone else', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_TEAM_ASSIGNED,
                            data: {assignee_team_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_TEAM_ASSIGNED,
                            data: {assignee_team_id: 2},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because ticket is unassigned and re-assigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_TEAM_ASSIGNED,
                            data: {assignee_team_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_TEAM_UNASSIGNED,
                        },
                        {
                            created_datetime: 2,
                            type: constants.TICKET_TEAM_ASSIGNED,
                            data: {assignee_team_id: 1},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.TICKET_TEAM_UNASSIGNED, () => {
                it('because ticket is assigned and re-unassigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_TEAM_ASSIGNED,
                            data: {assignee_team_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_TEAM_UNASSIGNED,
                        },
                        {
                            created_datetime: 2,
                            type: constants.TICKET_TEAM_ASSIGNED,
                            data: {assignee_team_id: 1},
                        },
                        {
                            created_datetime: 3,
                            type: constants.TICKET_TEAM_UNASSIGNED,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.TICKET_TRASHED, () => {
                it('because ticket is untrashed and re-trashed', () => {
                    const events = fromJS([
                        {created_datetime: 0, type: constants.TICKET_TRASHED},
                        {created_datetime: 1, type: constants.TICKET_UNTRASHED},
                        {created_datetime: 2, type: constants.TICKET_TRASHED},
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.TICKET_UNASSIGNED, () => {
                it('because ticket is assigned and re-unassigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_ASSIGNED,
                            data: {assignee_user_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_UNASSIGNED,
                        },
                        {
                            created_datetime: 2,
                            type: constants.TICKET_ASSIGNED,
                            data: {assignee_user_id: 1},
                        },
                        {
                            created_datetime: 3,
                            type: constants.TICKET_UNASSIGNED,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.TICKET_UNMARKED_SPAM, () => {
                it('because ticket is marked as spam and re-unmarked', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: constants.TICKET_UNMARKED_SPAM,
                        },
                        {
                            created_datetime: 1,
                            type: constants.TICKET_MARKED_SPAM,
                        },
                        {
                            created_datetime: 2,
                            type: constants.TICKET_UNMARKED_SPAM,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.TICKET_UNTRASHED, () => {
                it('because ticket is trashed and re-untrashed', () => {
                    const events = fromJS([
                        {created_datetime: 0, type: constants.TICKET_UNTRASHED},
                        {created_datetime: 1, type: constants.TICKET_TRASHED},
                        {created_datetime: 2, type: constants.TICKET_UNTRASHED},
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(constants.RULE_EXECUTED, () => {
                it('because it should never get deduplicated', () => {
                    const events = fromJS([
                        {created_datetime: 0, type: constants.RULE_EXECUTED},
                        {created_datetime: 1, type: constants.RULE_EXECUTED},
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })
        })
    })
})
