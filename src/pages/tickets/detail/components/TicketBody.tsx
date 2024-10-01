import classnames from 'classnames'
import {List} from 'immutable'
import React, {useCallback, useEffect, useMemo, useRef} from 'react'
import {Components, Virtuoso, VirtuosoHandle} from 'react-virtuoso'

import useAppSelector from 'hooks/useAppSelector'
import useSelectedIndex from 'hooks/useSelectedIndex'
import {TicketElement, TicketMessage} from 'models/ticket/types'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'
import type {OnToggleUnreadFn} from 'tickets/pages/SplitTicketPage'
import {getDisplayHistory} from 'state/ticket/selectors'
import VoiceRecordingsProvider from 'pages/integrations/integration/components/voice/VoiceRecordingsProvider'

import {
    useExpandedMessages,
    useGroupedElements,
    useHighlightedElements,
    useKeyboardNavigation,
    useLastMessageDatetimeAfterMount,
} from '../hooks'
import MessageQuoteContext from './MessageQuoteContext'
import TicketBodyElement from './TicketBodyElement'
import TicketFooter, {TicketFooterContext} from './TicketFooter'
import TicketHeaderWrapper from './TicketHeaderWrapper'

import css from './TicketBody.less'

interface Props {
    customScrollParentRef?: React.RefObject<HTMLDivElement>
    elements: List<any>
    hideTicket: () => Promise<void>
    isShopperTyping: boolean
    setStatus: (s: string) => void
    shopperName: string
    submit: (params: SubmitArgs) => any
    onGoToNextTicket?: () => void
    onToggleUnread?: OnToggleUnreadFn
}

export default function TicketBody({
    customScrollParentRef,
    elements,
    hideTicket,
    isShopperTyping,
    setStatus,
    shopperName,
    submit,
    onGoToNextTicket,
    onToggleUnread,
}: Props) {
    const virtuosoRef = useRef<VirtuosoHandle | null>(null)
    const [expandedMessages, toggleMessage] = useExpandedMessages()
    const groupedElements = useGroupedElements()
    const [highlightedElements, setHighlightedElements] =
        useHighlightedElements()
    const lastMessageDatetimeAfterMount =
        useLastMessageDatetimeAfterMount(elements)

    const maxIndex = elements.size - 1
    const {
        index: selectedIndex,
        next: nextIndex,
        previous: previousIndex,
    } = useSelectedIndex(maxIndex, {initial: maxIndex})
    useKeyboardNavigation({next: nextIndex, previous: previousIndex})

    const isHistoryDisplayed = useAppSelector(getDisplayHistory)
    useEffect(() => {
        if (!isHistoryDisplayed) return
        virtuosoRef.current?.scrollTo({top: 0})
    }, [isHistoryDisplayed])

    const getFollowOutput = useCallback(
        (isAtBottom: boolean) => (isAtBottom ? 'smooth' : false),
        []
    )
    const virtuosoComponents: Components<TicketFooterContext> = useMemo(
        () => ({
            Footer: TicketFooter,
            Item: (props) => {
                const {context: __context, style, children, ...rest} = props
                return (
                    <div {...rest} style={{...style, position: 'relative'}}>
                        {children}
                    </div>
                )
            },
        }),
        []
    )

    const footerContext = useMemo(
        (): TicketFooterContext => ({isShopperTyping, shopperName, submit}),
        [isShopperTyping, shopperName, submit]
    )

    const getItemContent = useCallback(
        (index, element) =>
            element === 'header' ? (
                <TicketHeaderWrapper
                    hideTicket={hideTicket}
                    setStatus={setStatus}
                    onGoToNextTicket={onGoToNextTicket}
                    onToggleUnread={onToggleUnread}
                />
            ) : (
                <TicketBodyElement
                    element={element}
                    hasCursor={selectedIndex === index}
                    highlightedElements={highlightedElements}
                    index={index}
                    isLast={index === elements.size}
                    lastMessageDatetimeAfterMount={
                        lastMessageDatetimeAfterMount
                    }
                    setHighlightedElements={setHighlightedElements}
                    setStatus={setStatus}
                />
            ),
        [
            elements,
            hideTicket,
            highlightedElements,
            lastMessageDatetimeAfterMount,
            selectedIndex,
            setHighlightedElements,
            setStatus,
            onGoToNextTicket,
            onToggleUnread,
        ]
    )

    return (
        <VoiceRecordingsProvider>
            <MessageQuoteContext.Provider
                value={{
                    expandedQuotes: expandedMessages,
                    toggleQuote: toggleMessage,
                }}
            >
                <Virtuoso<
                    TicketElement | TicketMessage[] | 'header',
                    TicketFooterContext
                >
                    ref={virtuosoRef}
                    className={classnames(css.wrapper)}
                    components={virtuosoComponents}
                    context={footerContext}
                    customScrollParent={
                        customScrollParentRef?.current || undefined
                    }
                    data={groupedElements}
                    followOutput={getFollowOutput}
                    initialTopMostItemIndex={{index: 'LAST'}}
                    itemContent={getItemContent}
                    topItemCount={1}
                />
            </MessageQuoteContext.Provider>
        </VoiceRecordingsProvider>
    )
}
