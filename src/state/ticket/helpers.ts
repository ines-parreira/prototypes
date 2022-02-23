import moment, {Moment} from 'moment'
import {fromJS, List, Map} from 'immutable'

import {TicketEventType, TICKET_EVENT_TYPES} from 'models/event/types'
import {TicketStatus} from 'business/types/ticket'
import {TAGS_ADDED_KEY, TAGS_REMOVED_KEY} from 'models/event/constants'

const MAX_DIFF_SECONDS = 5

type TicketState = {
    assigneeUserId: number | null
    assigneeTeamId: number | null
    status: string | null
    spam: boolean | null
    trashed: boolean | null
    snoozedAt: Moment | null
    tags: Array<number>
}

/**
 * Return `true` if we should deduplicate audit log events for the given ticket.
 * Fix for duplicated events has been deployed at 2019-12-10T00:06:02Z UTC (Dec 9, 2019, 4:06 PM PST).
 */
export function shouldDeduplicateAuditLogEvents(
    ticketCreatedDatetime: string
): boolean {
    return moment
        .utc(ticketCreatedDatetime)
        .isBefore(moment.utc('2019-12-10T01:00:00Z'))
}

// TODO(@samy): delete in a few months
export function deduplicateAuditLogEvents(events: List<any>) {
    const results: Map<any, any>[] = []
    const ticketState: TicketState = {
        assigneeUserId: null,
        assigneeTeamId: null,
        status: null,
        spam: null,
        trashed: null,
        snoozedAt: null,
        tags: [],
    }

    const sortedEvents = events.sortBy((event: Map<any, any>) =>
        moment(event.get('created_datetime'))
    )

    sortedEvents.forEach((event: Map<any, any>) => {
        const type = event.get('type') as TicketEventType

        switch (type) {
            case TICKET_EVENT_TYPES.TicketAssigned: {
                const assigneeUserId = event.getIn([
                    'data',
                    'assignee_user_id',
                ]) as number

                if (ticketState.assigneeUserId !== assigneeUserId) {
                    ticketState.assigneeUserId = assigneeUserId
                    results.push(event)
                }

                break
            }

            case TICKET_EVENT_TYPES.TicketClosed:
                if (ticketState.status !== TicketStatus.Closed) {
                    ticketState.status = TicketStatus.Closed
                    results.push(event)
                }
                break

            case TICKET_EVENT_TYPES.TicketCreated:
                if (ticketState.status !== TicketStatus.Open) {
                    ticketState.status = TicketStatus.Open
                    results.push(event)
                }
                break

            case TICKET_EVENT_TYPES.TicketMarkedSpam:
                if (ticketState.spam !== true) {
                    ticketState.spam = true
                    results.push(event)
                }
                break

            case TICKET_EVENT_TYPES.TicketReopened:
                if (ticketState.status !== TicketStatus.Open) {
                    ticketState.status = TicketStatus.Open
                    results.push(event)
                }
                break

            case TICKET_EVENT_TYPES.TicketSnoozed: {
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

            case TICKET_EVENT_TYPES.TicketTagsAdded: {
                const tagsAdded = event.getIn([
                    'data',
                    TAGS_ADDED_KEY,
                ]) as List<any>
                const deduplicatedTagsAdded: Map<any, any>[] = []

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

            case TICKET_EVENT_TYPES.TicketTagsRemoved: {
                const tagsRemoved = event.getIn([
                    'data',
                    TAGS_REMOVED_KEY,
                ]) as List<any>
                const deduplicatedTagsRemoved: Map<any, any>[] = []

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

            case TICKET_EVENT_TYPES.TicketTeamAssigned: {
                const assigneeTeamId = event.getIn(['data', 'assignee_team_id'])

                if (ticketState.assigneeTeamId !== assigneeTeamId) {
                    ticketState.assigneeTeamId = assigneeTeamId
                    results.push(event)
                }

                break
            }

            case TICKET_EVENT_TYPES.TicketTeamUnassigned:
                if (ticketState.assigneeTeamId !== null) {
                    ticketState.assigneeTeamId = null
                    results.push(event)
                }
                break

            case TICKET_EVENT_TYPES.TicketTrashed:
                if (ticketState.trashed !== true) {
                    ticketState.trashed = true
                    results.push(event)
                }
                break

            case TICKET_EVENT_TYPES.TicketUnassigned:
                if (ticketState.assigneeUserId !== null) {
                    ticketState.assigneeUserId = null
                    results.push(event)
                }
                break

            case TICKET_EVENT_TYPES.TicketUnmarkedSpam:
                if (ticketState.spam !== false) {
                    ticketState.spam = false
                    results.push(event)
                }
                break

            case TICKET_EVENT_TYPES.TicketUntrashed:
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

    return fromJS(results) as List<any>
}
