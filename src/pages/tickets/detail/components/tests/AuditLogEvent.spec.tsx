import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {SYSTEM_RULE_TYPE, TAGS_ADDED_KEY} from 'models/event/constants'
import {
    TicketEventType,
    EventObjectType,
    EventData,
    TICKET_EVENT_TYPES,
} from 'models/event/types'
import {RuleEvent} from 'state/rules/types'

import {AuditLogEventContainer} from '../AuditLogEvent'

describe('<AuditLogEvent/>', () => {
    const minProps = {
        users: fromJS([
            {id: 1, name: 'User 1'},
            {id: 2, name: 'User 2'},
            {id: 3, name: '', email: 'user3@example.com'},
        ]),
        teams: fromJS([
            {id: 1, name: 'Team 1'},
            {id: 2, name: 'Team 2'},
            {id: 3, name: 'Team 3'},
        ]),
        tags: {
            1: {id: 1, name: 'tag-1'},
            2: {id: 2, name: 'tag-2'},
            3: {id: 3, name: 'tag-3'},
        },
        events: fromJS([]),
        setHighlightedElements: jest.fn(),
    } as unknown as ComponentProps<typeof AuditLogEventContainer>

    const getEvent = (
        eventType: TicketEventType,
        data: EventData | null = null,
        options?: Record<string, unknown>
    ) => ({
        id: 1,
        account_id: 1,
        user_id: 1,
        object_type: EventObjectType.Ticket,
        object_id: 1,
        data,
        context: 'foo',
        type: eventType,
        created_datetime: '2019-11-15 19:00:00.000000',
        ...options,
    })

    describe('render()', () => {
        describe('should render', () => {
            it.each<[TicketEventType, EventData | null]>([
                [TICKET_EVENT_TYPES.RuleExecuted, {id: 1, name: 'Rule 1'}],
                [TICKET_EVENT_TYPES.TicketAssigned, {assignee_user_id: 1}],
                [TICKET_EVENT_TYPES.TicketClosed, null],
                [TICKET_EVENT_TYPES.TicketCreated, null],
                [TICKET_EVENT_TYPES.TicketCustomerUpdated, null],
                [TICKET_EVENT_TYPES.TicketMarkedSpam, null],
                [TICKET_EVENT_TYPES.TicketMerged, null],
                [TICKET_EVENT_TYPES.TicketSnoozed, null],
                [TICKET_EVENT_TYPES.TicketSelfUnsnoozed, null],
                [TICKET_EVENT_TYPES.TicketTagsAdded, {tags_added: [1]}],
                [TICKET_EVENT_TYPES.TicketTagsRemoved, {tags_removed: [1]}],
                [TICKET_EVENT_TYPES.TicketTeamAssigned, {assignee_team_id: 1}],
                [TICKET_EVENT_TYPES.TicketTeamUnassigned, null],
                [TICKET_EVENT_TYPES.TicketTrashed, null],
                [TICKET_EVENT_TYPES.TicketUnassigned, null],
                [TICKET_EVENT_TYPES.TicketUnmarkedSpam, null],
                [TICKET_EVENT_TYPES.TicketUntrashed, null],
                [
                    TICKET_EVENT_TYPES.TicketMessageSummaryCreated,
                    {
                        first_unseen_id: 1,
                        last_unseen_id: 2,
                    },
                ],
                [TICKET_EVENT_TYPES.TicketReopened, null],
                [
                    TICKET_EVENT_TYPES.TicketSubjectUpdated,
                    {
                        old_subject: 'foo',
                        new_subject: 'bar',
                    },
                ],
            ])('with event type %s', (eventType, eventData) => {
                const event = getEvent(eventType, eventData)
                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it.each<[TicketEventType, EventData]>([
                [TICKET_EVENT_TYPES.TicketTagsAdded, {tags_added: [1, 2]}],
                [TICKET_EVENT_TYPES.TicketTagsRemoved, {tags_removed: [1, 2]}],
            ])('with event type %s and several tags', (eventType, data) => {
                const event = getEvent(eventType, data)
                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it.each<[TicketEventType, EventData]>([
                [TICKET_EVENT_TYPES.TicketAssigned, {assignee_user_id: 9}],
                [TICKET_EVENT_TYPES.TicketTeamAssigned, {assignee_team_id: 9}],
            ])('with event type %s and missing assignee', (eventType, data) => {
                const event = getEvent(eventType, data)
                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('when the rule has a triggering event type', () => {
                const event = getEvent(TICKET_EVENT_TYPES.RuleExecuted, {
                    id: 1,
                    name: 'Rule 1',
                    triggering_event_type: RuleEvent.TicketCreated,
                })

                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('when the rule has failed actions', () => {
                const event = getEvent(TICKET_EVENT_TYPES.RuleExecuted, {
                    id: 1,
                    name: 'Rule 1',
                    triggering_event_type: RuleEvent.TicketCreated,
                    failed_actions: fromJS([
                        {
                            action_name: 'applyMacro',
                            failure_reason: 'recent-auto-reply',
                        },
                    ]),
                })

                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('when the user ID is missing', () => {
                const event = getEvent(
                    TICKET_EVENT_TYPES.TicketReopened,
                    null,
                    {
                        user_id: null,
                    }
                )

                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('when the event is the last component to display before the reply area', () => {
                const event = getEvent(TICKET_EVENT_TYPES.TicketReopened)

                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={true}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('when the event has been added via a rule', () => {
                const ruleExecutedEvent = getEvent(
                    TICKET_EVENT_TYPES.RuleExecuted
                )

                // Event added after `ruleExecutedEvent`, with the same `context`
                const event = getEvent(
                    TICKET_EVENT_TYPES.TicketReopened,
                    null,
                    {
                        id: 2,
                        created_datetime: '2019-11-15 19:00:00.500000',
                    }
                )
                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        events={fromJS([ruleExecutedEvent, event])}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('should render via team auto assignment when the event is auto assigned', () => {
                const event = getEvent(
                    TICKET_EVENT_TYPES.TicketAssigned,
                    {
                        assignee_user_id: 9,
                        auto_assigned: true,
                    },
                    {user_id: null}
                )
                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('when the customer has changed', () => {
                const event = getEvent(
                    TICKET_EVENT_TYPES.TicketCustomerUpdated,
                    {
                        old_customer: {
                            id: 2,
                            name: 'customer 2',
                        },
                        new_customer: {
                            id: 3,
                            name: 'customer 3',
                        },
                    }
                )

                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('when the customer has changed - name is empty', () => {
                const event = getEvent(
                    TICKET_EVENT_TYPES.TicketCustomerUpdated,
                    {
                        old_customer: {
                            id: 2,
                            name: null,
                        },
                        new_customer: {
                            id: 3,
                            name: '',
                        },
                    }
                )

                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('when the ticket subject updated data is null', () => {
                const event = getEvent(TICKET_EVENT_TYPES.TicketSubjectUpdated)
                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )
                expect(component).toMatchSnapshot()
            })

            it('should fallback to the email address when user has no name', () => {
                const event = {
                    ...getEvent(TICKET_EVENT_TYPES.TicketSubjectUpdated),
                    user_id: 3,
                }
                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )
                expect(component).toMatchSnapshot()
            })
        })

        describe('should not render', () => {
            it('when the content is missing', () => {
                const event = getEvent('invalid' as any)

                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('when the executed rule is a system rule', () => {
                const event = getEvent(TICKET_EVENT_TYPES.RuleExecuted, {
                    type: SYSTEM_RULE_TYPE,
                })

                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })

            it('when tag is missing', () => {
                const event = getEvent(TICKET_EVENT_TYPES.TicketTagsAdded, {
                    [TAGS_ADDED_KEY]: [999],
                })

                const component = shallow(
                    <AuditLogEventContainer
                        {...minProps}
                        event={fromJS(event)}
                        isLast={false}
                    />
                )

                expect(component).toMatchSnapshot()
            })
        })
    })
})
