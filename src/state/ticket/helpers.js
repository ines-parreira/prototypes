// @flow

import moment from 'moment'
import {fromJS, type List, Record} from 'immutable'

import {
    AuditLogEvent,
    TAGS_ADDED_KEY,
    TAGS_REMOVED_KEY,
} from '../../models/event'
import * as constants from '../../constants/event'
import {CLOSED_STATUS, OPEN_STATUS} from '../../config/ticket'

const MAX_DIFF_SECONDS = 5

type TicketState = {
    assigneeUserId: number | null,
    assigneeTeamId: number | null,
    status: string | null,
    spam: boolean | null,
    trashed: boolean | null,
    snoozedAt: moment | null,
    tags: Array<number>,
}

/**
 * Return `true` if we should deduplicate audit log events for the given ticket.
 * Fix for duplicated events has been deployed at 2019-12-10T00:06:02Z UTC (Dec 9, 2019, 4:06 PM PST).
 * @param {string} ticketCreatedDatetime
 * @returns {boolean}
 */
export function shouldDeduplicateAuditLogEvents(
    ticketCreatedDatetime: string
): boolean {
    return moment
        .utc(ticketCreatedDatetime)
        .isBefore(moment.utc('2019-12-10T01:00:00Z'))
}

// TODO(@samy): delete in a few months
export function deduplicateAuditLogEvents(events: List<Record<AuditLogEvent>>) {
    const results = []
    const ticketState: TicketState = {
        assigneeUserId: null,
        assigneeTeamId: null,
        status: null,
        spam: null,
        trashed: null,
        snoozedAt: null,
        tags: [],
    }

    const sortedEvents = events.sortBy((event) =>
        moment(event.get('created_datetime'))
    )

    sortedEvents.forEach((event) => {
        const type = event.get('type')

        switch (type) {
            case constants.TICKET_ASSIGNED: {
                const assigneeUserId = event.getIn(['data', 'assignee_user_id'])

                if (ticketState.assigneeUserId !== assigneeUserId) {
                    ticketState.assigneeUserId = assigneeUserId
                    results.push(event)
                }

                break
            }

            case constants.TICKET_CLOSED:
                if (ticketState.status !== CLOSED_STATUS) {
                    ticketState.status = CLOSED_STATUS
                    results.push(event)
                }
                break

            case constants.TICKET_CREATED:
                if (ticketState.status !== OPEN_STATUS) {
                    ticketState.status = OPEN_STATUS
                    results.push(event)
                }
                break

            case constants.TICKET_MARKED_SPAM:
                if (ticketState.spam !== true) {
                    ticketState.spam = true
                    results.push(event)
                }
                break

            case constants.TICKET_REOPENED:
                if (ticketState.status !== OPEN_STATUS) {
                    ticketState.status = OPEN_STATUS
                    results.push(event)
                }
                break

            case constants.TICKET_SNOOZED: {
                const snoozedAt = moment(event.get('created_datetime'))

                if (ticketState.snoozedAt) {
                    const diff = snoozedAt.diff(
                        ticketState.snoozedAt,
                        'seconds',
                        true
                    )

                    if (Math.abs(diff) < MAX_DIFF_SECONDS) {
                        break
                    }
                }

                ticketState.snoozedAt = snoozedAt
                results.push(event)
                break
            }

            case constants.TICKET_TAGS_ADDED: {
                const tagsAdded = event.getIn(['data', TAGS_ADDED_KEY])
                const deduplicatedTagsAdded = []

                tagsAdded.forEach((tagAdded) => {
                    if (!ticketState.tags.includes(tagAdded)) {
                        ticketState.tags.push(tagAdded)
                        deduplicatedTagsAdded.push(tagAdded)
                    }
                })

                if (deduplicatedTagsAdded.length) {
                    results.push(
                        event.setIn(
                            ['data', TAGS_ADDED_KEY],
                            fromJS(deduplicatedTagsAdded)
                        )
                    )
                }

                break
            }

            case constants.TICKET_TAGS_REMOVED: {
                const tagsRemoved = event.getIn(['data', TAGS_REMOVED_KEY])
                const deduplicatedTagsRemoved = []

                tagsRemoved.forEach((tagRemoved) => {
                    if (ticketState.tags.includes(tagRemoved)) {
                        ticketState.tags = ticketState.tags.filter(
                            (ticketTag) => ticketTag !== tagRemoved
                        )
                        deduplicatedTagsRemoved.push(tagRemoved)
                    }
                })

                if (deduplicatedTagsRemoved.length) {
                    results.push(
                        event.setIn(
                            ['data', TAGS_REMOVED_KEY],
                            fromJS(deduplicatedTagsRemoved)
                        )
                    )
                }

                break
            }

            case constants.TICKET_TEAM_ASSIGNED: {
                const assigneeTeamId = event.getIn(['data', 'assignee_team_id'])

                if (ticketState.assigneeTeamId !== assigneeTeamId) {
                    ticketState.assigneeTeamId = assigneeTeamId
                    results.push(event)
                }

                break
            }

            case constants.TICKET_TEAM_UNASSIGNED:
                if (ticketState.assigneeTeamId !== null) {
                    ticketState.assigneeTeamId = null
                    results.push(event)
                }
                break

            case constants.TICKET_TRASHED:
                if (ticketState.trashed !== true) {
                    ticketState.trashed = true
                    results.push(event)
                }
                break

            case constants.TICKET_UNASSIGNED:
                if (ticketState.assigneeUserId !== null) {
                    ticketState.assigneeUserId = null
                    results.push(event)
                }
                break

            case constants.TICKET_UNMARKED_SPAM:
                if (ticketState.spam !== false) {
                    ticketState.spam = false
                    results.push(event)
                }
                break

            case constants.TICKET_UNTRASHED:
                if (ticketState.trashed !== false) {
                    ticketState.trashed = false
                    results.push(event)
                }
                break

            default:
                results.push(event)
                break
        }
    })

    return fromJS(results)
}
