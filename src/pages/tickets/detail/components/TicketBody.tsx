import React from 'react'
import moment, {Moment} from 'moment'
import {connect, ConnectedProps} from 'react-redux'
import _debounce from 'lodash/debounce'
import {fromJS, List, Map} from 'immutable'

import * as ticketSelectors from '../../../../state/ticket/selectors'
import shortcutManager from '../../../../services/shortcutManager/index'
import {moveIndex, MoveIndexDirection} from '../../../common/utils/keyboard'
import {RootState} from '../../../../state/types'
import {
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
} from '../../../../models/ticket/predicates'
import {TicketChannel} from '../../../../business/types/ticket'
import {
    PHONE_EVENTS,
    TICKET_AUDIT_LOG_EVENTS,
} from '../../../../constants/event'

import TicketMessages from './TicketMessages/TicketMessages'
import SatisfactionSurvey from './SatisfactionSurvey'
import AuditLogEvent from './AuditLogEvent'
import Event from './Event'
import PhoneEvent from './PhoneEvent/PhoneEvent'
import PrivateReplyEvent from './PrivateReplyEvent/PrivateReplyEvent'
import {PRIVATE_REPLY_ACTIONS} from './PrivateReplyEvent/constants'

// $TSFixMe replace with importing HighlightedElements from AuditLogEvent.tsx on migration
type HighlightedElements = {
    first: number
    last: number
}

type OwnProps = {
    elements: List<any>
    ticket: Map<any, any>
    setStatus?: (s: string) => void
    messageGroupingChannels: Channel[]
    messageGroupingDuration: string
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    messageCursor: number
    highlightedElements: HighlightedElements | null
}

export class TicketBody extends React.Component<Props, State> {
    static defaultProps: Pick<
        Props,
        'messageGroupingChannels' | 'messageGroupingDuration'
    > = {
        messageGroupingChannels: [
            TicketChannel.FacebookMessenger,
            TicketChannel.Chat,
        ],
        messageGroupingDuration: 'PT5M',
    }

    lastMessageDatetimeAfterMount: Moment | null

    _messageCursor = 0

    constructor(props: Props) {
        super(props)

        this.lastMessageDatetimeAfterMount = null
        if (!props.elements.isEmpty()) {
            this.lastMessageDatetimeAfterMount = moment(
                (props.elements.last() as Map<any, any>).get('created_datetime')
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

    _moveCursor(direction: MoveIndexDirection = MoveIndexDirection.Next) {
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
                action: () => this._moveCursor(MoveIndexDirection.Prev),
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

        return (elements.toJS() as TicketElement[]).reduce(
            (
                acc: (TicketElement | TicketMessage[])[],
                element: TicketElement | TicketMessage[]
            ) => {
                if (!isTicketMessage(element as TicketElement)) {
                    return acc.concat([
                        element as TicketEvent | TicketSatisfactionSurvey,
                    ])
                }

                if (!acc.length) {
                    return acc.concat([[element as TicketMessage]])
                }

                const prevGroup = acc[acc.length - 1]
                if (!Array.isArray(prevGroup)) {
                    return acc.concat([[element as TicketMessage]])
                }

                const firstInPrevGroup = prevGroup[0]
                if (
                    this._shouldMessagesBeGrouped(
                        firstInPrevGroup,
                        element as TicketMessage
                    )
                ) {
                    prevGroup.push(element as TicketMessage)
                    return acc
                }

                return acc.concat([[element as TicketMessage]])
            },
            [] as TicketElement[]
        )
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
                {this._getGroupedElements().map((element, index: number) => {
                    if (Array.isArray(element)) {
                        return this._renderMessages(element, index)
                    }

                    const elementMap: Map<any, any> = fromJS(element)
                    const elementType = elementMap.get('type')
                    const elementId = elementMap.get('id') as number
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
                })}
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
    ticket: state.ticket,
    lastReadMessage: ticketSelectors.getLastReadMessage(state),
}))

export default connector(TicketBody)
