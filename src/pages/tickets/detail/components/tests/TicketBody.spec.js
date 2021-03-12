//@flow
import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {TicketBody} from '../TicketBody'
import {message} from '../../../../../models/ticket/tests/mocks.ts'
import {
    INCOMING_PHONE_CALL,
    OUTGOING_PHONE_CALL,
    TICKET_ASSIGNED,
} from '../../../../../constants/event.ts'
import type {TicketMessage} from '../../../../../models/ticket'
import TicketMessages from '../TicketMessages/TicketMessages'
import Event from '../Event'

describe('TicketBody', () => {
    it('should display messages', () => {
        const component = shallow(
            <TicketBody
                elements={fromJS([
                    {
                        ...message,
                        id: 1,
                        created_datetime: '2017-07-01T18:00:00',
                    },
                ])}
                lastReadMessage={fromJS({
                    id: 1,
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC',
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display events with messages', () => {
        const component = shallow(
            <TicketBody
                elements={fromJS([
                    {
                        ...message,
                        id: 1,
                        created_datetime: '2017-07-01T18:00:00',
                    },
                    {
                        ...message,
                        isMessage: false,
                        isEvent: true,
                        created_datetime: '2017-07-01T19:00:00',
                    },
                ])}
                lastReadMessage={fromJS({
                    id: 1,
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC',
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display phone events', () => {
        const component = shallow(
            <TicketBody
                elements={fromJS([
                    {
                        id: 1,
                        isMessage: false,
                        isEvent: true,
                        created_datetime: '2017-07-01T19:00:00',
                        type: INCOMING_PHONE_CALL,
                    },
                    {
                        id: 2,
                        isMessage: false,
                        isEvent: true,
                        created_datetime: '2017-07-01T19:05:00',
                        type: OUTGOING_PHONE_CALL,
                    },
                ])}
                lastReadMessage={fromJS({
                    id: 1,
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC',
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display and highlight the messages', () => {
        const component = shallow(
            <TicketBody
                elements={fromJS([
                    {
                        ...message,
                        id: 1,
                        created_datetime: '2017-07-01T18:00:00',
                    },
                ])}
                highlightedElements={{first: 1}}
                lastReadMessage={fromJS({
                    id: 1,
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC',
                })}
            />
        )
        component.setState({highlightedElements: {first: 1}})

        expect(component).toMatchSnapshot()
    })

    it('should display and not highlight the messages', () => {
        const component = shallow(
            <TicketBody
                elements={fromJS([
                    {
                        ...message,
                        id: 1,
                        created_datetime: '2017-07-01T18:00:00',
                    },
                ])}
                highlightedElements={{first: 1}}
                lastReadMessage={fromJS({
                    id: 1,
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC',
                })}
            />
        )
        component.setState({highlightedElements: {first: 2}})

        expect(component).toMatchSnapshot()
    })

    it('should display audit log events with messages', () => {
        const component = shallow(
            <TicketBody
                elements={fromJS([
                    {
                        ...message,
                        id: 1,
                        created_datetime: '2017-07-01T18:00:00',
                    },
                    {
                        id: 1,
                        account_id: 1,
                        user_id: 1,
                        object_type: 'Ticket',
                        object_id: 1,
                        data: null,
                        context: 'foo',
                        type: TICKET_ASSIGNED,
                        created_datetime: '2019-11-15 19:00:00.000000',
                        isEvent: true,
                    },
                ])}
                lastReadMessage={fromJS({
                    id: 1,
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC',
                })}
            />
        )

        expect(component).toMatchSnapshot()
    })

    describe('last read message', () => {
        it('should pass `isLastReadMessage` only for the last read message', () => {
            const component = shallow(
                <TicketBody
                    elements={fromJS([
                        {
                            ...message,
                            id: 1,
                            created_datetime: '2017-07-01T18:00:00',
                        },
                        {
                            ...message,
                            id: 2,
                            created_datetime: '2017-07-01T19:00:00',
                        },
                        {
                            ...message,
                            id: undefined,
                            created_datetime: '2017-07-01T20:00:00',
                        },
                    ])}
                    lastReadMessage={fromJS({
                        id: 1,
                    })}
                    loadingState={fromJS([])}
                    ticket={fromJS({id: 1})}
                    setStatus={() => {}}
                    currentUser={fromJS({
                        timezone: 'UTC',
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should not pass `isLastReadMessage` for a new message', () => {
            const component = shallow(
                <TicketBody
                    elements={fromJS([
                        {
                            id: undefined,
                            created_datetime: '2017-07-01T18:00:00',
                        },
                    ])}
                    lastReadMessage={fromJS({
                        id: undefined,
                    })}
                    loadingState={fromJS([])}
                    ticket={fromJS({id: 1})}
                    setStatus={() => {}}
                    currentUser={fromJS({
                        timezone: 'UTC',
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('message grouping', () => {
        const DefaultTicketBody = (props: {}) => (
            <TicketBody
                lastReadMessage={fromJS({
                    id: undefined,
                })}
                loadingState={fromJS([])}
                ticket={fromJS({id: 1})}
                setStatus={() => {}}
                currentUser={fromJS({
                    timezone: 'UTC',
                })}
                messageGroupingChannels={['chat']}
                messageGroupingDuration="PT5M"
                {...props}
            />
        )

        const message1: TicketMessage = {
            ...message,
            channel: 'chat',
            created_datetime: '2018-01-01T12:00:00.000Z',
        }

        const message2: TicketMessage = {
            ...message1,
            created_datetime: '2018-01-01T12:01:00.000Z',
        }

        it('should group messages if they have the same channel and ', () => {
            const component = shallow(
                <DefaultTicketBody elements={fromJS([message1, message2])} />
            )
            const ticketMessages = component
                .find(TicketBody)
                .dive()
                .find(TicketMessages)
            expect(ticketMessages).toHaveLength(1)
        })

        it('should not group messages if they have different channels', () => {
            const component = shallow(
                <DefaultTicketBody
                    elements={fromJS([
                        message1,
                        {
                            ...message2,
                            channel: 'email',
                        },
                    ])}
                />
            )
            const ticketMessages = component
                .find(TicketBody)
                .dive()
                .find(TicketMessages)
            expect(ticketMessages).toHaveLength(2)
        })

        it('should not group messages if they have the same channel, but the channel is not grouped', () => {
            const component = shallow(
                <DefaultTicketBody
                    elements={fromJS([message1, message2])}
                    messageGroupingChannels={'mail'}
                />
            )
            const ticketMessages = component
                .find(TicketBody)
                .dive()
                .find(TicketMessages)
            expect(ticketMessages).toHaveLength(2)
        })

        it('should not group messages if they do not fall into the grouping interval', () => {
            const component = shallow(
                <DefaultTicketBody
                    elements={fromJS([
                        message1,
                        {
                            ...message2,
                            created_datetime: '2018-01-01T13:00:00.000Z',
                        },
                    ])}
                />
            )
            const ticketMessages = component
                .find(TicketBody)
                .dive()
                .find(TicketMessages)
            expect(ticketMessages).toHaveLength(2)
        })

        it('should not group elements if they are not messages', () => {
            const component = shallow(
                <DefaultTicketBody
                    elements={fromJS([
                        message1,
                        {
                            ...message2,
                            isMessage: false,
                            isEvent: true,
                        },
                    ])}
                />
            )
            const body = component.find(TicketBody).dive()
            expect(body.find(TicketMessages)).toHaveLength(1)
            expect(body.find(Event)).toHaveLength(1)
        })

        it('should not group messages if they are not from the same sender', () => {
            const component = shallow(
                <DefaultTicketBody
                    elements={fromJS([
                        message1,
                        {
                            ...message2,
                            sender: {
                                ...message2.sender,
                                id: 123123,
                            },
                        },
                    ])}
                />
            )
            const body = component.find(TicketBody).dive()
            expect(body.find(TicketMessages)).toHaveLength(2)
        })

        it('should not merge the messages if one of them is private', () => {
            const component = shallow(
                <DefaultTicketBody
                    elements={fromJS([
                        {
                            ...message1,
                            public: false,
                        },
                        message2,
                    ])}
                />
            )
            const body = component.find(TicketBody).dive()
            expect(body.find(TicketMessages)).toHaveLength(2)
        })

        it('should not merge the messages if one is from agent and the second is not', () => {
            const component = shallow(
                <DefaultTicketBody
                    elements={fromJS([
                        {
                            ...message1,
                            from_agent: false,
                        },
                        {
                            ...message2,
                            from_agent: true,
                        },
                    ])}
                />
            )
            const body = component.find(TicketBody).dive()
            expect(body.find(TicketMessages)).toHaveLength(2)
        })
    })
})
