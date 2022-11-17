import React, {createContext, ReactNode} from 'react'
import moment, {Moment} from 'moment'
import {connect, ConnectedProps} from 'react-redux'
import _debounce from 'lodash/debounce'
import {fromJS, List, Map} from 'immutable'
import {Virtuoso, VirtuosoHandle} from 'react-virtuoso'
import _xor from 'lodash/xor'
import _noop from 'lodash/noop'
import classnames from 'classnames'

import {
    Channel,
    TicketElement,
    TicketEvent,
    TicketMessage,
    TicketSatisfactionSurvey,
} from 'models/ticket/types'
import {
    isTicketEvent,
    isTicketMessage,
    isTicketRuleSuggestion,
    isTicketSatisfactionSurvey,
} from 'models/ticket/predicates'
import {TicketChannel} from 'business/types/ticket'
import * as ticketSelectors from 'state/ticket/selectors'
import shortcutManager from 'services/shortcutManager/index'
import {moveIndex, MoveIndexDirection} from 'pages/common/utils/keyboard'
import {PHONE_EVENTS} from 'constants/event'
import {RootState} from 'state/types'
import {getActionByName} from 'config/actions'

import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'
import TicketHeaderWrapper from 'pages/tickets/detail/components/TicketHeaderWrapper'
import {reportError} from 'utils/errors'
import TicketMessages from './TicketMessages/TicketMessages'
import PhoneEvent from './PhoneEvent/PhoneEvent'
import PrivateReplyEvent from './PrivateReplyEvent/PrivateReplyEvent'
import {PRIVATE_REPLY_ACTIONS} from './PrivateReplyEvent/constants'
import SatisfactionSurvey from './SatisfactionSurvey'
import AuditLogEvent, {contentfulEventTypesValues} from './AuditLogEvent'
import Event from './Event'
import RuleSuggestion from './RuleSuggestion'
import {ReplyFormWithVirtuosoContext} from './ReplyForm'

import css from './TicketBody.less'

type FakeVirtuosoItems = 'header'

type MessageContextState = {
    toggleQuote: (messageId: number | undefined) => void
    expandedQuotes: number[]
}

export const MessageQuoteContext = createContext<MessageContextState>({
    toggleQuote: _noop,
    expandedQuotes: [],
})

export type TicketVirtuosoContextType = {
    submit: (params: SubmitArgs) => any
    isShopperTyping: boolean
    shopperName: string
}

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
    customScrollParentRef?: React.RefObject<HTMLDivElement>
    submit: (params: SubmitArgs) => any
    hideTicket: () => Promise<void>
    handleHistoryToggle: () => void
    isShopperTyping: boolean
    shopperName: string
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    messageCursor: number
    highlightedElements: HighlightedElements | null
    expandedMessages: number[]
}

export class TicketBodyVirtualized extends React.Component<Props, State> {
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

    virtuosoRef = React.createRef<VirtuosoHandle>()

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
            expandedMessages: [],
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

    componentDidUpdate(prevProps: Readonly<Props>) {
        if (!prevProps.isHistoryDisplayed && this.props.isHistoryDisplayed) {
            this.virtuosoRef.current?.scrollTo({top: 0})
        }
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

        const groupedElements = (elements.toJS() as TicketElement[])
            .reduce(
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
            .filter((element) => {
                // filtering is applied to remove elements that would result in a null node rendered
                // react-virtuoso yields a warning when a null node is passed because it shouldn't handle zero-sized elements
                if (Array.isArray(element) || !isTicketEvent(element)) {
                    return true
                }

                const elementMap: Map<any, any> = fromJS(element)
                const actionName = elementMap.getIn(['data', 'action_name'])
                const actionConfig = getActionByName(actionName)

                return (
                    contentfulEventTypesValues.includes(
                        element.type as typeof contentfulEventTypesValues[number]
                    ) ||
                    PHONE_EVENTS.includes(element.type) ||
                    (PRIVATE_REPLY_ACTIONS.includes(actionName) &&
                        !!actionName) ||
                    !!actionConfig
                )
            })

        return ['header' as FakeVirtuosoItems, ...groupedElements]
    }

    toggleQuote = (messageId: number | undefined) => {
        if (messageId) {
            this.setState({
                expandedMessages: _xor(
                    [...this.state.expandedMessages],
                    [messageId]
                ),
            })
        }
    }

    _renderMessages(messages: TicketMessage[], index: number) {
        const {
            ticket,
            setStatus,
            lastReadMessage,
            lastCustomerMessage = fromJS({}),
            lastSentMessageFromAgent,
        } = this.props
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
                lastCustomerMessage={lastCustomerMessage}
                lastSentMessageIdFromAgent={lastSentMessageFromAgent.get('id')}
                hasCursor={this.state.messageCursor === index}
                highlightedElements={this.state.highlightedElements}
                customer={ticket.get('customer')}
            />
        )
    }

    render() {
        const {
            elements,
            ticket,
            submit,
            hideTicket,
            handleHistoryToggle,
            isShopperTyping,
            shopperName,
        } = this.props

        return (
            <MessageQuoteContext.Provider
                value={{
                    toggleQuote: this.toggleQuote,
                    expandedQuotes: this.state.expandedMessages,
                }}
            >
                <Virtuoso<
                    TicketElement | TicketMessage[] | 'header',
                    TicketVirtuosoContextType
                >
                    topItemCount={1}
                    ref={this.virtuosoRef}
                    customScrollParent={
                        this.props.customScrollParentRef?.current || undefined
                    }
                    data={this._getGroupedElements()}
                    className={classnames(css.wrapper, css.isVirtualized)}
                    initialTopMostItemIndex={{index: 'LAST'}}
                    followOutput={(isAtBottom: boolean) => {
                        if (isAtBottom) {
                            return 'smooth'
                        }
                        return false
                    }}
                    itemContent={(index, element) => {
                        let itemContent: ReactNode = null

                        if (element === 'header') {
                            itemContent = (
                                <TicketHeaderWrapper
                                    hideTicket={hideTicket}
                                    handleHistoryToggle={handleHistoryToggle}
                                />
                            )
                        } else if (Array.isArray(element)) {
                            itemContent = this._renderMessages(element, index)
                        } else {
                            const elementMap: Map<any, any> = fromJS(element)
                            const elementType = elementMap.get('type')
                            const elementId = elementMap.get('id') as number
                            const isLast = index === elements.size
                            const key = `event-${elementId}`
                            const action_name = elementMap.getIn([
                                'data',
                                'action_name',
                            ])

                            if (isTicketSatisfactionSurvey(element)) {
                                itemContent = (
                                    <SatisfactionSurvey
                                        key={`survey-${index}`}
                                        satisfactionSurvey={elementMap}
                                        customer={ticket.get('customer')}
                                        isLast={isLast}
                                    />
                                )
                            } else if (isTicketRuleSuggestion(element))
                                itemContent = elements.find(
                                    (element: Map<any, any>) =>
                                        !!element.getIn([
                                            'meta',
                                            'rule_suggestion_slug',
                                        ])
                                ) ? null : (
                                    <RuleSuggestion
                                        ticket={ticket.toJS()}
                                        isCollapsed={!isLast}
                                    />
                                )
                            else if (isTicketEvent(element)) {
                                if (
                                    contentfulEventTypesValues.includes(
                                        elementType
                                    )
                                ) {
                                    itemContent = (
                                        <AuditLogEvent
                                            key={key}
                                            event={elementMap}
                                            isLast={isLast}
                                            setHighlightedElements={
                                                this.setHighlightedElements
                                            }
                                        />
                                    )
                                } else if (PHONE_EVENTS.includes(elementType)) {
                                    itemContent = (
                                        <PhoneEvent
                                            key={key}
                                            event={elementMap}
                                            isLast={isLast}
                                        />
                                    )
                                } else if (
                                    !!action_name &&
                                    PRIVATE_REPLY_ACTIONS.includes(action_name)
                                ) {
                                    itemContent = (
                                        <PrivateReplyEvent
                                            key={key}
                                            event={elementMap}
                                            isLast={isLast}
                                        />
                                    )
                                } else {
                                    itemContent = (
                                        <Event
                                            key={key}
                                            event={elementMap}
                                            isLast={isLast}
                                        />
                                    )
                                }
                            }
                        }

                        if (itemContent === null) {
                            reportError(new Error(`Null ticket element`), {
                                extra: {element},
                            })
                        }

                        return itemContent
                    }}
                    context={{
                        submit,
                        isShopperTyping,
                        shopperName,
                    }}
                    components={{
                        Footer: ReplyFormWithVirtuosoContext,
                    }}
                />
            </MessageQuoteContext.Provider>
        )
    }
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
    ticket: state.ticket,
    lastReadMessage: ticketSelectors.getLastReadMessage(state),
    isHistoryDisplayed: ticketSelectors.getDisplayHistory(state),
    lastCustomerMessage: ticketSelectors.getLastCustomerMessage(state),
    lastSentMessageFromAgent:
        ticketSelectors.getLastSentMessageFromAgent(state),
}))

export default connector(TicketBodyVirtualized)
