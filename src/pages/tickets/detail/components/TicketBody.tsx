import classnames from 'classnames'
import {List} from 'immutable'
import React, {useCallback, useEffect, useMemo, useRef} from 'react'
import {Virtuoso, VirtuosoHandle} from 'react-virtuoso'

import useAppSelector from 'hooks/useAppSelector'
import useSelectedIndex from 'hooks/useSelectedIndex'
import {TicketElement, TicketMessage} from 'models/ticket/types'
import {SubmitArgs} from 'pages/tickets/detail/TicketDetailContainer'
import {getDisplayHistory} from 'state/ticket/selectors'

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
    handleHistoryToggle: () => void
    hideTicket: () => Promise<void>
    isShopperTyping: boolean
    setStatus: (s: string) => void
    shopperName: string
    submit: (params: SubmitArgs) => any
}

export default function TicketBody({
    customScrollParentRef,
    elements,
    handleHistoryToggle,
    hideTicket,
    isShopperTyping,
    setStatus,
    shopperName,
    submit,
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
    const virtuosoComponents = useMemo(() => ({Footer: TicketFooter}), [])
    const footerContext = useMemo(
        (): TicketFooterContext => ({isShopperTyping, shopperName, submit}),
        [isShopperTyping, shopperName, submit]
    )

    const getItemContent = useCallback(
        (index, element) =>
            element === 'header' ? (
                <TicketHeaderWrapper
                    handleHistoryToggle={handleHistoryToggle}
                    hideTicket={hideTicket}
                    setStatus={setStatus}
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
            handleHistoryToggle,
            hideTicket,
            highlightedElements,
            lastMessageDatetimeAfterMount,
            selectedIndex,
            setHighlightedElements,
            setStatus,
        ]
    )

    return (
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
                customScrollParent={customScrollParentRef?.current || undefined}
                data={groupedElements}
                followOutput={getFollowOutput}
                initialTopMostItemIndex={{index: 'LAST'}}
                itemContent={getItemContent}
                topItemCount={1}
            />
        </MessageQuoteContext.Provider>
    )
}
