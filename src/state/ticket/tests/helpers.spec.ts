import {fromJS} from 'immutable'
import moment from 'moment'

import {TicketAuditLogEvent} from '../../../constants/integrations/types/event'
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
            it(TicketAuditLogEvent.TicketAssigned, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketAssigned,
                        data: {assignee_user_id: 1},
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketAssigned,
                        data: {assignee_user_id: 1},
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketAssigned,
                        data: {assignee_user_id: 1},
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketClosed, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketClosed,
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketClosed,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketClosed,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketCreated, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketCreated,
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketCreated,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketCreated,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketMarkedSpam, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketMarkedSpam,
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketMarkedSpam,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketMarkedSpam,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketReopened, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketReopened,
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketReopened,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketReopened,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketSnoozed, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketSnoozed,
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketSnoozed,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketSnoozed,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketTagsAdded, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketTagsAdded,
                        data: {[TAGS_ADDED_KEY]: [1]},
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketTagsAdded,
                        data: {[TAGS_ADDED_KEY]: [1]},
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketTagsAdded,
                        data: {[TAGS_ADDED_KEY]: [1]},
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketTagsRemoved, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketTagsAdded,
                        data: {[TAGS_ADDED_KEY]: [1]},
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketTagsRemoved,
                        data: {[TAGS_REMOVED_KEY]: [1]},
                    },
                    {
                        created_datetime: 2,
                        type: TicketAuditLogEvent.TicketTagsRemoved,
                        data: {[TAGS_REMOVED_KEY]: [1]},
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketTagsAdded,
                        data: {[TAGS_ADDED_KEY]: [1]},
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketTagsRemoved,
                        data: {[TAGS_REMOVED_KEY]: [1]},
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketTeamAssigned, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketTeamAssigned,
                        data: {assignee_team_id: 1},
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketTeamAssigned,
                        data: {assignee_team_id: 1},
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketTeamAssigned,
                        data: {assignee_team_id: 1},
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketTeamUnassigned, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketTeamAssigned,
                        data: {assignee_team_id: 1},
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketTeamUnassigned,
                    },
                    {
                        created_datetime: 2,
                        type: TicketAuditLogEvent.TicketTeamUnassigned,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketTeamAssigned,
                        data: {assignee_team_id: 1},
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketTeamUnassigned,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketTrashed, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketTrashed,
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketTrashed,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketTrashed,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketUnassigned, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketAssigned,
                        data: {assignee_user_id: 1},
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketUnassigned,
                    },
                    {
                        created_datetime: 2,
                        type: TicketAuditLogEvent.TicketUnassigned,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketAssigned,
                        data: {assignee_user_id: 1},
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketUnassigned,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketUnmarkedSpam, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketUnmarkedSpam,
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketUnmarkedSpam,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketUnmarkedSpam,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })

            it(TicketAuditLogEvent.TicketUntrashed, () => {
                const events = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketUntrashed,
                    },
                    {
                        created_datetime: 1,
                        type: TicketAuditLogEvent.TicketUntrashed,
                    },
                ])

                const expected = fromJS([
                    {
                        created_datetime: 0,
                        type: TicketAuditLogEvent.TicketUntrashed,
                    },
                ])

                expect(deduplicateAuditLogEvents(events)).toEqual(expected)
            })
        })

        describe('should keep two events of type', () => {
            describe(TicketAuditLogEvent.TicketAssigned, () => {
                it('because ticket is assigned to someone else', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketAssigned,
                            data: {assignee_user_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketAssigned,
                            data: {assignee_user_id: 2},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because ticket is unassigned and re-assigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketAssigned,
                            data: {assignee_user_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketUnassigned,
                        },
                        {
                            created_datetime: 2,
                            type: TicketAuditLogEvent.TicketAssigned,
                            data: {assignee_user_id: 1},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.TicketClosed, () => {
                it('because ticket is re-opened and closed again', () => {
                    const events = fromJS([
                        {
                            type: TicketAuditLogEvent.TicketClosed,
                            created_datetime: 0,
                        },
                        {
                            type: TicketAuditLogEvent.TicketReopened,
                            created_datetime: 1,
                        },
                        {
                            type: TicketAuditLogEvent.TicketClosed,
                            created_datetime: 2,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.TicketMarkedSpam, () => {
                it('because ticket is unmarked as spam and marked again', () => {
                    const events = fromJS([
                        {
                            type: TicketAuditLogEvent.TicketMarkedSpam,
                            created_datetime: 0,
                        },
                        {
                            type: TicketAuditLogEvent.TicketUnmarkedSpam,
                            created_datetime: 1,
                        },
                        {
                            type: TicketAuditLogEvent.TicketMarkedSpam,
                            created_datetime: 2,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.TicketReopened, () => {
                it('because ticket is closed and reopened again', () => {
                    const events = fromJS([
                        {
                            type: TicketAuditLogEvent.TicketReopened,
                            created_datetime: 0,
                        },
                        {
                            type: TicketAuditLogEvent.TicketClosed,
                            created_datetime: 1,
                        },
                        {
                            type: TicketAuditLogEvent.TicketReopened,
                            created_datetime: 2,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.TicketSnoozed, () => {
                it('because ticket is snoozed a second time, more than 5 seconds after the first time', () => {
                    const events = fromJS([
                        {
                            type: TicketAuditLogEvent.TicketSnoozed,
                            created_datetime: moment(0).valueOf(),
                        },
                        {
                            type: TicketAuditLogEvent.TicketSnoozed,
                            created_datetime: moment(0)
                                .add(6, 'seconds')
                                .valueOf(),
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.TicketTagsAdded, () => {
                it('because added tags are different', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketTagsAdded,
                            data: {[TAGS_ADDED_KEY]: [1]},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketTagsAdded,
                            data: {[TAGS_ADDED_KEY]: [2]},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because added tags in second event contain some new tags', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketTagsAdded,
                            data: {[TAGS_ADDED_KEY]: [1]},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketTagsAdded,
                            data: {[TAGS_ADDED_KEY]: [1, 2]},
                        },
                    ])

                    const expected = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketTagsAdded,
                            data: {[TAGS_ADDED_KEY]: [1]},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketTagsAdded,
                            data: {[TAGS_ADDED_KEY]: [2]},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(expected)
                })
            })

            describe(TicketAuditLogEvent.TicketTagsRemoved, () => {
                it('because removed tags are different', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketTagsAdded,
                            data: {[TAGS_ADDED_KEY]: [1, 2]},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketTagsRemoved,
                            data: {[TAGS_REMOVED_KEY]: [1]},
                        },
                        {
                            created_datetime: 2,
                            type: TicketAuditLogEvent.TicketTagsRemoved,
                            data: {[TAGS_REMOVED_KEY]: [2]},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because removed tags in second event contain some new tags', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketTagsAdded,
                            data: {[TAGS_ADDED_KEY]: [1, 2]},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketTagsRemoved,
                            data: {[TAGS_REMOVED_KEY]: [1]},
                        },
                        {
                            created_datetime: 2,
                            type: TicketAuditLogEvent.TicketTagsRemoved,
                            data: {[TAGS_REMOVED_KEY]: [1, 2]},
                        },
                    ])

                    const expected = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketTagsAdded,
                            data: {[TAGS_ADDED_KEY]: [1, 2]},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketTagsRemoved,
                            data: {[TAGS_REMOVED_KEY]: [1]},
                        },
                        {
                            created_datetime: 2,
                            type: TicketAuditLogEvent.TicketTagsRemoved,
                            data: {[TAGS_REMOVED_KEY]: [2]},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(expected)
                })
            })

            describe(TicketAuditLogEvent.TicketTeamAssigned, () => {
                it('because ticket is assigned to someone else', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketTeamAssigned,
                            data: {assignee_team_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketTeamAssigned,
                            data: {assignee_team_id: 2},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })

                it('because ticket is unassigned and re-assigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketTeamAssigned,
                            data: {assignee_team_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketTeamUnassigned,
                        },
                        {
                            created_datetime: 2,
                            type: TicketAuditLogEvent.TicketTeamAssigned,
                            data: {assignee_team_id: 1},
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.TicketTeamUnassigned, () => {
                it('because ticket is assigned and re-unassigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketTeamAssigned,
                            data: {assignee_team_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketTeamUnassigned,
                        },
                        {
                            created_datetime: 2,
                            type: TicketAuditLogEvent.TicketTeamAssigned,
                            data: {assignee_team_id: 1},
                        },
                        {
                            created_datetime: 3,
                            type: TicketAuditLogEvent.TicketTeamUnassigned,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.TicketTrashed, () => {
                it('because ticket is untrashed and re-trashed', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketTrashed,
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketUntrashed,
                        },
                        {
                            created_datetime: 2,
                            type: TicketAuditLogEvent.TicketTrashed,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.TicketUnassigned, () => {
                it('because ticket is assigned and re-unassigned', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketAssigned,
                            data: {assignee_user_id: 1},
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketUnassigned,
                        },
                        {
                            created_datetime: 2,
                            type: TicketAuditLogEvent.TicketAssigned,
                            data: {assignee_user_id: 1},
                        },
                        {
                            created_datetime: 3,
                            type: TicketAuditLogEvent.TicketUnassigned,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.TicketUnmarkedSpam, () => {
                it('because ticket is marked as spam and re-unmarked', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketUnmarkedSpam,
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketMarkedSpam,
                        },
                        {
                            created_datetime: 2,
                            type: TicketAuditLogEvent.TicketUnmarkedSpam,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.TicketUntrashed, () => {
                it('because ticket is trashed and re-untrashed', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.TicketUntrashed,
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.TicketTrashed,
                        },
                        {
                            created_datetime: 2,
                            type: TicketAuditLogEvent.TicketUntrashed,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })

            describe(TicketAuditLogEvent.RuleExecuted, () => {
                it('because it should never get deduplicated', () => {
                    const events = fromJS([
                        {
                            created_datetime: 0,
                            type: TicketAuditLogEvent.RuleExecuted,
                        },
                        {
                            created_datetime: 1,
                            type: TicketAuditLogEvent.RuleExecuted,
                        },
                    ])

                    expect(deduplicateAuditLogEvents(events)).toEqual(events)
                })
            })
        })
    })
})
