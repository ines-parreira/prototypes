import React, {createContext} from 'react'
import moment, {Moment} from 'moment'
import {connect, ConnectedProps} from 'react-redux'
import _debounce from 'lodash/debounce'
import {fromJS, List, Map} from 'immutable'
import {Virtuoso, VirtuosoHandle} from 'react-virtuoso'
import _xor from 'lodash/xor'
import _noop from 'lodash/noop'
import classnames from 'classnames'

import {TicketElement, TicketMessage} from 'models/ticket/types'
import {isTicketEvent, isTicketRuleSuggestion} from 'models/ticket/predicates'
import * as ticketSelectors from 'state/ticket/selectors'
import shortcutManager from 'services/shortcutManager/index'
import {moveIndex, MoveIndexDirection} from 'pages/common/utils/keyboard'
import {PHONE_EVENTS} from 'constants/event'
import {RootState} from 'state/types'
import {getActionByName} from 'config/actions'

import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'
import TicketBodyElement from 'pages/tickets/detail/components/TicketBodyElement'
import TicketHeaderWrapper from 'pages/tickets/detail/components/TicketHeaderWrapper'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {PRIVATE_REPLY_ACTIONS} from './PrivateReplyEvent/constants'
import {contentfulEventTypesValues} from './AuditLogEvent'
import {
    getRuleSuggestionContent,
    isSuggestionEmpty,
} from './RuleSuggestion/RuleSuggestion'
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
    setStatus: (s: string) => void
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

    _getGroupedElements() {
        const groupedElements = this.props.groupedElements.filter((element) => {
            // filtering is applied to remove elements that would result in a null node rendered
            // react-virtuoso yields a warning when a null node is passed because it shouldn't handle zero-sized elements

            if (Array.isArray(element)) return true
            if (isTicketRuleSuggestion(element))
                return !(
                    isSuggestionEmpty(
                        getRuleSuggestionContent(this.props.ticket.toJS())
                    ) || !this.props.hasAutomationAddon
                )
            if (!isTicketEvent(element)) return true

            const elementMap: Map<any, any> = fromJS(element)
            const actionName = elementMap.getIn(['data', 'action_name'])
            const actionConfig = getActionByName(actionName)

            return (
                contentfulEventTypesValues.includes(
                    element.type as typeof contentfulEventTypesValues[number]
                ) ||
                PHONE_EVENTS.includes(element.type) ||
                (PRIVATE_REPLY_ACTIONS.includes(actionName) && !!actionName) ||
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

    render() {
        const {
            elements,
            submit,
            hideTicket,
            handleHistoryToggle,
            isShopperTyping,
            setStatus,
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
                    followOutput={(isAtBottom: boolean) =>
                        isAtBottom ? 'smooth' : false
                    }
                    itemContent={(index, element) =>
                        element === 'header' ? (
                            <TicketHeaderWrapper
                                hideTicket={hideTicket}
                                handleHistoryToggle={handleHistoryToggle}
                                setStatus={setStatus}
                            />
                        ) : (
                            <TicketBodyElement
                                element={element}
                                hasCursor={this.state.messageCursor === index}
                                highlightedElements={
                                    this.state.highlightedElements
                                }
                                index={index}
                                isLast={index === elements.size}
                                lastMessageDatetimeAfterMount={
                                    this.lastMessageDatetimeAfterMount
                                }
                                setHighlightedElements={
                                    this.setHighlightedElements
                                }
                                setStatus={setStatus}
                            />
                        )
                    }
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
    groupedElements: ticketSelectors.getTicketBodyElements(state),
    isHistoryDisplayed: ticketSelectors.getDisplayHistory(state),
    ticket: state.ticket,
    hasAutomationAddon: getHasAutomationAddOn(state),
}))

export default connector(TicketBodyVirtualized)
