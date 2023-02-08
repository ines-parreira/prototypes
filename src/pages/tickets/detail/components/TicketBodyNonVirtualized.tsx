// TODO: remove component entirely after Virtualization is tested out

import React from 'react'
import moment, {Moment} from 'moment'
import {connect, ConnectedProps} from 'react-redux'
import _debounce from 'lodash/debounce'
import {fromJS, List, Map} from 'immutable'

import _xor from 'lodash/xor'
import {TicketMessage} from 'models/ticket/types'
import {
    isTicketAISuggestion,
    isTicketEvent,
    isTicketRuleSuggestion,
    isTicketSatisfactionSurvey,
} from 'models/ticket/predicates'
import * as ticketSelectors from 'state/ticket/selectors'
import shortcutManager from 'services/shortcutManager/index'
import {moveIndex, MoveIndexDirection} from 'pages/common/utils/keyboard'
import {PHONE_EVENTS} from 'constants/event'
import {RootState} from 'state/types'

import TicketMessages from './TicketMessages/TicketMessages'
import SatisfactionSurvey from './SatisfactionSurvey'
import AuditLogEvent, {contentfulEventTypesValues} from './AuditLogEvent'
import Event from './Event'
import PhoneEvent from './PhoneEvent/PhoneEvent'
import PrivateReplyEvent from './PrivateReplyEvent/PrivateReplyEvent'
import {PRIVATE_REPLY_ACTIONS} from './PrivateReplyEvent/constants'

import css from './TicketBody.less'
import RuleSuggestion from './RuleSuggestion/RuleSuggestion'
import {MessageQuoteContext} from './TicketBodyVirtualized'
import AISuggestion from './RuleSuggestion/AISuggestion'

// $TSFixMe replace with importing HighlightedElements from AuditLogEvent.tsx on migration
type HighlightedElements = {
    first: number
    last: number
}

type OwnProps = {
    elements: List<any>
    setStatus?: (s: string) => void
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    messageCursor: number
    highlightedElements: HighlightedElements | null
    expandedMessages: number[]
}

export class TicketBodyNonVirtualized extends React.Component<Props, State> {
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
                hasCursor={this.state.messageCursor === index}
                highlightedElements={this.state.highlightedElements}
                customer={ticket.get('customer')}
            />
        )
    }

    render() {
        const {elements, groupedElements, ticket} = this.props

        if (elements.size === 0) {
            return null
        }

        return (
            <MessageQuoteContext.Provider
                value={{
                    toggleQuote: this.toggleQuote,
                    expandedQuotes: this.state.expandedMessages,
                }}
            >
                <div className={css.wrapper}>
                    {groupedElements.map((element, index: number) => {
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

                        if (isTicketRuleSuggestion(element))
                            return (
                                <RuleSuggestion
                                    key={`rule-suggestion-${index}`}
                                    ticket={ticket.toJS()}
                                    isCollapsed={!isLast}
                                />
                            )

                        if (isTicketAISuggestion(element))
                            return (
                                <AISuggestion
                                    key={`ai-suggestion-${index}`}
                                    ticket={ticket.toJS()}
                                    isCollapsed={!isLast}
                                />
                            )

                        if (isTicketEvent(element)) {
                            if (
                                contentfulEventTypesValues.includes(elementType)
                            ) {
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
            </MessageQuoteContext.Provider>
        )
    }
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
    groupedElements: ticketSelectors.getTicketBodyElements(state),
    ticket: state.ticket,
    lastReadMessage: ticketSelectors.getLastReadMessage(state),
    lastCustomerMessage: ticketSelectors.getLastCustomerMessage(state),
}))

export default connector(TicketBodyNonVirtualized)
