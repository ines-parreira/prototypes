// @flow

import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as constants from '../../../../../constants/event.ts'
import Component from '../AuditLogEvent'

import {
    type AuditLogEvent,
    type AuditLogEventType,
    SYSTEM_RULE_TYPE,
    TAGS_ADDED_KEY,
} from '../../../../../models/event'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<AuditLogEvent/>', () => {
    const getState = () => ({
        agents: fromJS({
            all: [
                {id: 1, name: 'User 1'},
                {id: 2, name: 'User 2'},
                {id: 3, name: 'User 3'},
            ],
        }),
        teams: fromJS({
            all: {
                '1': {id: 1, name: 'Team 1'},
                '2': {id: 2, name: 'Team 2'},
                '3': {id: 3, name: 'Team 3'},
            },
        }),
        tags: fromJS({
            items: [
                {id: 1, name: 'tag-1'},
                {id: 2, name: 'tag-2'},
                {id: 3, name: 'tag-3'},
            ],
        }),
        ticket: fromJS({
            events: [],
        }),
    })

    const store = mockStore(getState())

    const getEvent = (eventType: AuditLogEventType): AuditLogEvent => ({
        id: 1,
        account_id: 1,
        user_id: 1,
        object_type: 'Ticket',
        object_id: 1,
        data: null,
        context: 'foo',
        type: eventType,
        created_datetime: '2019-11-15 19:00:00.000000',
    })

    describe('render()', () => {
        describe('should render', () => {
            it.each(constants.TICKET_AUDIT_LOG_EVENTS)(
                'with event type %s',
                (eventType: AuditLogEventType) => {
                    const event = getEvent(eventType)

                    switch (eventType) {
                        case constants.RULE_EXECUTED:
                            event.data = {id: 1, name: 'Rule 1'}
                            break
                        case constants.TICKET_TAGS_ADDED:
                            event.data = {tags_added: [1]}
                            break
                        case constants.TICKET_TAGS_REMOVED:
                            event.data = {tags_removed: [1]}
                            break
                        case constants.TICKET_ASSIGNED:
                            event.data = {assignee_user_id: 1}
                            break
                        case constants.TICKET_TEAM_ASSIGNED:
                            event.data = {assignee_team_id: 1}
                            break
                        default:
                            break
                    }

                    const component = shallow(
                        <Component
                            store={store}
                            event={fromJS(event)}
                            isLast={false}
                        />
                    ).dive()

                    expect(component).toMatchSnapshot()
                }
            )

            const tagsEventTypes = [
                constants.TICKET_TAGS_ADDED,
                constants.TICKET_TAGS_REMOVED,
            ]
            it.each(tagsEventTypes)(
                'with event type %s and several tags',
                (eventType: AuditLogEventType) => {
                    const event = getEvent(eventType)

                    event.data =
                        eventType === constants.TICKET_TAGS_ADDED
                            ? {tags_added: [1, 2]}
                            : {tags_removed: [1, 2]}

                    const component = shallow(
                        <Component
                            store={store}
                            event={fromJS(event)}
                            isLast={false}
                        />
                    ).dive()

                    expect(component).toMatchSnapshot()
                }
            )

            const assignEventType = [
                constants.TICKET_ASSIGNED,
                constants.TICKET_TEAM_ASSIGNED,
            ]
            it.each(assignEventType)(
                'with event type %s and missing assignee',
                (eventType: AuditLogEventType) => {
                    const event = getEvent(eventType)

                    event.data =
                        eventType === constants.TICKET_ASSIGNED
                            ? {assignee_user_id: 9}
                            : {assignee_team_id: 9}

                    const component = shallow(
                        <Component
                            store={store}
                            event={fromJS(event)}
                            isLast={false}
                        />
                    ).dive()

                    expect(component).toMatchSnapshot()
                }
            )

            it('when the user ID is missing', () => {
                const event = getEvent(constants.TICKET_REOPENED)
                event.user_id = null

                const component = shallow(
                    <Component
                        store={store}
                        event={fromJS(event)}
                        isLast={false}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            })

            it('when the event is the last component to display before the reply area', () => {
                const event = getEvent(constants.TICKET_REOPENED)

                const component = shallow(
                    <Component
                        store={store}
                        event={fromJS(event)}
                        isLast={true}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            })

            it('when the event has been added via a rule', () => {
                const ruleExecutedEvent = getEvent(constants.RULE_EXECUTED)

                // Event added after `ruleExecutedEvent`, with the same `context`
                const event = getEvent(constants.TICKET_REOPENED)
                event.id = 2
                event.created_datetime = '2019-11-15 19:00:00.500000'

                const component = shallow(
                    <Component
                        store={mockStore({
                            ...getState(),
                            ticket: fromJS({
                                events: [
                                    fromJS(ruleExecutedEvent),
                                    fromJS(event),
                                ],
                            }),
                        })}
                        event={fromJS(event)}
                        isLast={false}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            })

            it('when the customer has changed', () => {
                const event = getEvent(constants.TICKET_CUSTOMER_UPDATED)
                event.data = {
                    old_customer: {
                        id: 2,
                        name: 'customer 2',
                    },
                    new_customer: {
                        id: 3,
                        name: 'customer 3',
                    },
                }

                const component = shallow(
                    <Component
                        store={store}
                        event={fromJS(event)}
                        isLast={false}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            })

            it('when the customer has changed - name is empty', () => {
                const event = getEvent(constants.TICKET_CUSTOMER_UPDATED)
                event.data = {
                    old_customer: {
                        id: 2,
                        name: null,
                    },
                    new_customer: {
                        id: 3,
                        name: '',
                    },
                }

                const component = shallow(
                    <Component
                        store={store}
                        event={fromJS(event)}
                        isLast={false}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            })
        })

        describe('should not render', () => {
            it('when the content is missing', () => {
                const event = getEvent('invalid')

                const component = shallow(
                    <Component
                        store={store}
                        event={fromJS(event)}
                        isLast={false}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            })

            it('when the executed rule is a system rule', () => {
                const event = getEvent(constants.RULE_EXECUTED)
                event.data = {type: SYSTEM_RULE_TYPE}

                const component = shallow(
                    <Component
                        store={store}
                        event={fromJS(event)}
                        isLast={false}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            })

            it('when tag is missing', () => {
                const event = getEvent(constants.TICKET_TAGS_ADDED)
                event.data = {[TAGS_ADDED_KEY]: [999]}

                const component = shallow(
                    <Component
                        store={store}
                        event={fromJS(event)}
                        isLast={false}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            })
        })
    })
})
