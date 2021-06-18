//@flow

import React from 'react'
import moment from 'moment'
import {connect} from 'react-redux'
import _debounce from 'lodash/debounce'
import {fromJS, List, Map} from 'immutable'

import * as ticketSelectors from '../../../../state/ticket/selectors.ts'
import shortcutManager from '../../../../services/shortcutManager/index.ts'
import {
    moveIndex,
    type MoveIndexDirection,
} from '../../../common/utils/keyboard.ts'
import type {stateType} from '../../../../state/types'
import type {
    Channel,
    TicketElement,
    TicketEvent,
    TicketMessage,
    TicketSatisfactionSurvey,
} from '../../../../models/ticket/types'
import {
    isTicketEvent,
    isTicketMessage,
    isTicketSatisfactionSurvey,
} from '../../../../models/ticket'
import {TicketChannels} from '../../../../business/ticket.ts'
import {
    PHONE_EVENTS,
    TICKET_AUDIT_LOG_EVENTS,
} from '../../../../constants/event.ts'

import TicketMessages from './TicketMessages'
import SatisfactionSurvey from './SatisfactionSurvey'
import AuditLogEvent from './AuditLogEvent.tsx'
import Event from './Event'
import PhoneEvent from './PhoneEvent/PhoneEvent.tsx'
import PrivateReplyEvent from './PrivateReplyEvent/PrivateReplyEvent.tsx'
import {PRIVATE_REPLY_ACTIONS} from './PrivateReplyEvent/constants.ts'

// $TSFixMe replace with importing HighlightedElements from AuditLogEvent.tsx on migration
type HighlightedElements = {
    first: number,
    last: number,
}

type Props = {
    currentUser: Map<*, *>,
    // TODO (@pwlmaciejewski): After bumping immutable to v4 it can be a List<RecordOf<TicketElement>>
    elements: List<*>,
    ticket: Map<*, *>,
    setStatus?: (string) => void,
    lastReadMessage: Map<*, *>,
    messageGroupingChannels: Channel[],
    messageGroupingDuration: string,
}

type State = {
    messageCursor: number,
    highlightedElements: HighlightedElements | null,
}

export class TicketBody extends React.Component<Props, State> {
    static defaultProps: $Shape<Props> = {
        messageGroupingChannels: [
            TicketChannels.FACEBOOK_MESSENGER,
            TicketChannels.CHAT,
        ],
        messageGroupingDuration: 'PT5M',
    }

    lastMessageDatetimeAfterMount: ?moment$Moment

    _messageCursor: number = 0

    constructor(props: Props) {
        super(props)

        this.lastMessageDatetimeAfterMount = null
        if (!props.elements.isEmpty()) {
            this.lastMessageDatetimeAfterMount = moment(
                props.elements.last().get('created_datetime')
            )
        }

        this._messageCursor = props.elements.size - 1
        this.state = {
            messageCursor: this._messageCursor,
            highlightedElements: null,
        }
    }

    setHighlightedElements = (value: HighlightedElements) => {
        this.setState({highlightedElements: value})
        setTimeout(() => {
            this.setState({highlightedElements: null})
        }, 1000)
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    _updateCursorState = _debounce(() => {
        this.setState({
            messageCursor: this._messageCursor,
        })
    })

    _moveCursor(direction: MoveIndexDirection = 'next') {
        const newCursorPosition = moveIndex(
            this._messageCursor,
            this.props.elements.size,
            {direction}
        )
        if (this._messageCursor !== newCursorPosition) {
            this._messageCursor = newCursorPosition
            this._updateCursorState()
        }
    }

    _bindKeys() {
        shortcutManager.bind('TicketDetailContainer', {
            GO_NEXT_MESSAGE: {
                action: () => this._moveCursor(),
            },
            GO_PREV_MESSAGE: {
                action: () => this._moveCursor('previous'),
            },
        })
    }

    _shouldMessagesBeGrouped = (msg1: TicketMessage, msg2: TicketMessage) => {
        const groupingDuration = moment.duration(
            this.props.messageGroupingDuration
        )

        if (
            !isTicketMessage(msg1) ||
            !isTicketMessage(msg2) ||
            msg1.sender.id !== msg2.sender.id ||
            msg1.channel !== msg2.channel ||
            !this.props.messageGroupingChannels.includes(msg1.channel) ||
            moment(msg2.created_datetime).isAfter(
                moment(msg1.created_datetime).add(groupingDuration)
            ) ||
            msg1.public !== msg2.public ||
            msg1.from_agent !== msg2.from_agent
        ) {
            return false
        }

        return true
    }

    _getGroupedElements() {
        const {elements} = this.props

        return elements
            .toJS()
            .reduce((acc: TicketElement[], element: TicketElement) => {
                if (!isTicketMessage(element)) {
                    return acc.concat([element])
                }

                const message = ((element: any): TicketMessage)

                if (!acc.length) {
                    return acc.concat([[message]])
                }

                const prevGroup = acc[acc.length - 1]
                if (!Array.isArray(prevGroup)) {
                    return acc.concat([[message]])
                }

                const firstInPrevGroup = prevGroup[0]
                if (this._shouldMessagesBeGrouped(firstInPrevGroup, message)) {
                    prevGroup.push(message)
                    return acc
                }

                return acc.concat([[message]])
            }, [])
    }

    _renderMessages(messages: TicketMessage[], index: number) {
        const {ticket, setStatus, lastReadMessage} = this.props
        const id = `message-${index}`

        return (
            <TicketMessages
                id={id}
                key={id}
                messages={messages}
                ticketId={ticket.get('id')}
                timezone={this.props.currentUser.get('timezone')}
                lastMessageDatetimeAfterMount={
                    this.lastMessageDatetimeAfterMount
                }
                setStatus={setStatus}
                lastReadMessageId={lastReadMessage.get('id')}
                hasCursor={this.state.messageCursor === index}
                highlightedElements={this.state.highlightedElements}
            />
        )
    }

    render() {
        const {elements, ticket} = this.props

        if (elements.size === 0) {
            return null
        }

        return (
            <div className="TicketMessages">
                {this._getGroupedElements().map(
                    (
                        element:
                            | TicketEvent
                            | TicketSatisfactionSurvey
                            | TicketMessage[],
                        index: number
                    ) => {
                        if (Array.isArray(element)) {
                            return this._renderMessages(element, index)
                        }

                        const elementMap: Map<*, *> = fromJS(element)
                        const elementType = elementMap.get('type')
                        const elementId = elementMap.get('id')
                        const isLast = index === elements.size - 1
                        const key = `event-${elementId}`
                        const action_name = elementMap.getIn([
                            'data',
                            'action_name',
                        ])

                        if (isTicketSatisfactionSurvey(element)) {
                            return (
                                <SatisfactionSurvey
                                    key={`survey-${index}`}
                                    satisfactionSurvey={elementMap}
                                    customer={ticket.get('customer')}
                                    isLast={isLast}
                                />
                            )
                        }

                        if (isTicketEvent(element)) {
                            if (TICKET_AUDIT_LOG_EVENTS.includes(elementType)) {
                                return (
                                    <AuditLogEvent
                                        key={key}
                                        event={elementMap}
                                        isLast={isLast}
                                        setHighlightedElements={
                                            this.setHighlightedElements
                                        }
                                    />
                                )
                            }

                            if (PHONE_EVENTS.includes(elementType)) {
                                return (
                                    <PhoneEvent
                                        key={key}
                                        event={elementMap}
                                        isLast={isLast}
                                    />
                                )
                            }

                            if (
                                !!action_name &&
                                PRIVATE_REPLY_ACTIONS.includes(action_name)
                            ) {
                                return (
                                    <PrivateReplyEvent
                                        key={key}
                                        event={elementMap}
                                        isLast={isLast}
                                    />
                                )
                            }

                            return (
                                <Event
                                    key={key}
                                    event={elementMap}
                                    isLast={isLast}
                                />
                            )
                        }

                        return null
                    }
                )}
            </div>
        )
    }
}

export default connect((state: stateType) => {
    return {
        currentUser: state.currentUser,
        ticket: state.ticket,
        lastReadMessage: ticketSelectors.getLastReadMessage(state),
    }
})(TicketBody)
