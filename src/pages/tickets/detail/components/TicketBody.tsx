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
import {ReplyFormWithVirtuosoContext} from './ReplyForm'
import TicketBodyElement from './TicketBodyElement'
import TicketHeaderWrapper from './TicketHeaderWrapper'

import css from './TicketBody.less'

export type TicketVirtuosoContextType = {
    isShopperTyping: boolean
    shopperName: string
    submit: (params: SubmitArgs) => any
}

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
    const virtuosoComponents = useMemo(
        () => ({Footer: ReplyFormWithVirtuosoContext}),
        []
    )
    const virtuosoContext = useMemo(
        () => ({isShopperTyping, shopperName, submit}),
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
                TicketVirtuosoContextType
            >
                ref={virtuosoRef}
                className={classnames(css.wrapper, css.isVirtualized)}
                components={virtuosoComponents}
                context={virtuosoContext}
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
