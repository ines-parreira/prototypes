import React, {ComponentProps} from 'react'
import {shallow, ShallowWrapper} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import _omit from 'lodash/omit'
import {VirtuosoProps} from 'react-virtuoso'

import {ShopifyActionType} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/types'
import {message} from 'models/ticket/tests/mocks'
import {TicketMessage} from 'models/ticket/types'
import {TICKET_EVENT_TYPES} from 'models/event/types'
import {TicketBodyVirtualized} from 'pages/tickets/detail/components/TicketBodyVirtualized'
import TicketMessages from 'pages/tickets/detail/components/TicketMessages/TicketMessages'
import {TicketChannel} from 'business/types/ticket'
import {INCOMING_PHONE_CALL, OUTGOING_PHONE_CALL} from 'constants/event'
import AuditLogEvent from 'pages/tickets/detail/components/AuditLogEvent'
import * as ticketPredicates from 'models/ticket/predicates'
import {reportError} from 'utils/errors'

jest.mock('react-virtuoso', () => {
    function Virtuoso(props: VirtuosoProps<unknown, unknown>) {
        return (
            <>
                {props.data?.map((value, index) =>
                    props.itemContent?.(index, value, undefined)
                )}
            </>
        )
    }

    return {Virtuoso}
})

jest.spyOn(ticketPredicates, 'isTicketSatisfactionSurvey')

jest.mock('utils/errors')
const mockReport = reportError as jest.Mock<typeof reportError>

describe('TicketBody', () => {
    const commonProps = {
        lastReadMessage: fromJS({
            id: 1,
        }),
        ticket: fromJS({id: 1}),
        setStatus: _noop,
        currentUser: fromJS({
            timezone: 'UTC',
        }),
    } as ComponentProps<typeof TicketBodyVirtualized>

    it('should display messages', () => {
        const component = shallow(
            <TicketBodyVirtualized
                {...commonProps}
                elements={fromJS([
                    {
                        ...message,
                        id: 1,
                        created_datetime: '2017-07-01T18:00:00',
                    },
                ])}
            />
        )

        expect(component.dive().dive()).toMatchSnapshot()
    })

    it('should display events with messages', () => {
        const component = shallow(
            <TicketBodyVirtualized
                {...commonProps}
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
                        data: {
                            action_name: ShopifyActionType.RefundOrder,
                        },
                    },
                ])}
            />
        )

        expect(component.dive().dive()).toMatchSnapshot()
    })

    it('should display phone events', () => {
        const component = shallow(
            <TicketBodyVirtualized
                {...commonProps}
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
            />
        )

        expect(component.dive().dive()).toMatchSnapshot()
    })

    it('should display and highlight the messages', () => {
        const component = shallow(
            <TicketBodyVirtualized
                {...commonProps}
                elements={fromJS([
                    {
                        ...message,
                        id: 1,
                        created_datetime: '2017-07-01T18:00:00',
                    },
                ])}
            />
        )
        component.setState({highlightedElements: {first: 1}})

        expect(component.dive().dive()).toMatchSnapshot()
    })

    it('should display and not highlight the messages', () => {
        const component = shallow(
            <TicketBodyVirtualized
                {...commonProps}
                elements={fromJS([
                    {
                        ...message,
                        id: 1,
                        created_datetime: '2017-07-01T18:00:00',
                    },
                ])}
            />
        )
        component.setState({highlightedElements: {first: 2}})

        expect(component.dive().dive()).toMatchSnapshot()
    })

    it('should display audit log events with messages', () => {
        const component = shallow(
            <TicketBodyVirtualized
                {...commonProps}
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
                        type: TICKET_EVENT_TYPES.TicketAssigned,
                        created_datetime: '2019-11-15 19:00:00.000000',
                        isEvent: true,
                    },
                ])}
            />
        )

        expect(component.dive().dive()).toMatchSnapshot()
    })

    describe('last read message', () => {
        it('should pass `isLastReadMessage` only for the last read message', () => {
            const component = shallow(
                <TicketBodyVirtualized
                    {...commonProps}
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
                />
            )

            expect(component.dive().dive()).toMatchSnapshot()
        })

        it('should not pass `isLastReadMessage` for a new message', () => {
            const component = shallow(
                <TicketBodyVirtualized
                    {...commonProps}
                    elements={fromJS([
                        {
                            id: undefined,
                            created_datetime: '2017-07-01T18:00:00',
                        },
                    ])}
                    lastReadMessage={fromJS({
                        id: undefined,
                    })}
                />
            )

            expect(component.dive().dive()).toMatchSnapshot()
        })
    })

    describe('message grouping', () => {
        const minProps = {..._omit(commonProps, ['lastReadMessage'])}

        const DefaultTicketBody = (props: ComponentProps<any>) => (
            <TicketBodyVirtualized
                lastReadMessage={fromJS({
                    id: undefined,
                })}
                messageGroupingChannels={[TicketChannel.Chat]}
                messageGroupingDuration="PT5M"
                lastCustomerMessage={fromJS({
                    id: undefined,
                })}
                {...props}
            />
        )

        const message1: TicketMessage = {
            ...message,
            channel: TicketChannel.Chat,
            created_datetime: '2018-01-01T12:00:00.000Z',
        }

        const message2: TicketMessage = {
            ...message1,
            created_datetime: '2018-01-01T12:01:00.000Z',
        }

        const findTicketMessages = (
            component: ShallowWrapper<typeof DefaultTicketBody>
        ) =>
            component
                .find(TicketBodyVirtualized)
                .dive()
                .dive()
                .dive()
                .find(TicketMessages)

        it('should group messages if they have the same channel and ', () => {
            const component = shallow(
                <DefaultTicketBody
                    {...minProps}
                    elements={fromJS([message1, message2])}
                />
            )
            const ticketMessages = findTicketMessages(component)
            expect(ticketMessages).toHaveLength(1)
        })

        it('should not group messages if they have different channels', () => {
            const component = shallow(
                <DefaultTicketBody
                    {...minProps}
                    elements={fromJS([
                        message1,
                        {
                            ...message2,
                            channel: 'email',
                        },
                    ])}
                />
            )
            const ticketMessages = findTicketMessages(component)
            expect(ticketMessages).toHaveLength(2)
        })

        it('should not group messages if they have the same channel, but the channel is not grouped', () => {
            const component = shallow(
                <DefaultTicketBody
                    {...minProps}
                    elements={fromJS([message1, message2])}
                    messageGroupingChannels={[TicketChannel.Email]}
                />
            )
            const ticketMessages = findTicketMessages(component)
            expect(ticketMessages).toHaveLength(2)
        })

        it('should not group messages if they do not fall into the grouping interval', () => {
            const component = shallow(
                <DefaultTicketBody
                    {...minProps}
                    elements={fromJS([
                        message1,
                        {
                            ...message2,
                            created_datetime: '2018-01-01T13:00:00.000Z',
                        },
                    ])}
                />
            )
            const ticketMessages = findTicketMessages(component)
            expect(ticketMessages).toHaveLength(2)
        })

        it('should not group elements if they are not messages', () => {
            const component = shallow(
                <DefaultTicketBody
                    {...minProps}
                    elements={fromJS([
                        message1,
                        {
                            ...message2,
                            isMessage: false,
                            isEvent: true,
                            type: TICKET_EVENT_TYPES.TicketAssigned,
                        },
                    ])}
                />
            )
            const ticketMessages = findTicketMessages(component)

            expect(ticketMessages).toHaveLength(1)
            expect(
                component
                    .find(TicketBodyVirtualized)
                    .dive()
                    .dive()
                    .dive()
                    .find(AuditLogEvent)
            ).toHaveLength(1)
        })

        it('should not group messages if they are not from the same sender', () => {
            const component = shallow(
                <DefaultTicketBody
                    {...minProps}
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
            const ticketMessages = findTicketMessages(component)
            expect(ticketMessages).toHaveLength(2)
        })

        it('should not merge the messages if one of them is private', () => {
            const component = shallow(
                <DefaultTicketBody
                    {...minProps}
                    elements={fromJS([
                        {
                            ...message1,
                            public: false,
                        },
                        message2,
                    ])}
                />
            )
            const ticketMessages = findTicketMessages(component)
            expect(ticketMessages).toHaveLength(2)
        })

        it('should not merge the messages if one is from agent and the second is not', () => {
            const component = shallow(
                <DefaultTicketBody
                    {...minProps}
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
            const ticketMessages = findTicketMessages(component)
            expect(ticketMessages).toHaveLength(2)
        })
    })

    it('should alert Sentry if no representation exists for ticket element', () => {
        jest.spyOn(
            ticketPredicates,
            'isTicketSatisfactionSurvey'
        ).mockReturnValue(false)

        const component = shallow(
            <TicketBodyVirtualized
                {...commonProps}
                elements={fromJS([
                    {
                        id: 1,
                        isSatisfactionSurvey: true,
                    },
                ])}
            />
        )
        component.dive().dive()
        expect(mockReport).toHaveBeenCalled()
    })

    it('should display rule suggestion in correct order', () => {
        const component = shallow(
            <TicketBodyVirtualized
                {...commonProps}
                elements={fromJS([
                    {
                        ...message,
                        id: 1,
                        created_datetime: '2017-07-01T18:00:00',
                    },
                    {
                        id: 1,
                        slug: 'slug',
                        actions: [
                            {
                                args: [{body_text: 'body_text'}],
                                name: 'replyToTicket',
                            },
                        ],
                        isRuleSuggestion: true,
                    },
                    {
                        ...message,
                        id: 2,
                        created_datetime: '2017-07-01T18:30:00',
                    },
                ])}
            />
        )

        expect(component.dive().dive()).toMatchSnapshot()
    })
})
