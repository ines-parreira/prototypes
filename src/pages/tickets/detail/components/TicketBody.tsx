import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import classnames from 'classnames'
import { List } from 'immutable'
import { Components, Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import useSearch from 'hooks/useSearch'
import useSelectedIndex from 'hooks/useSelectedIndex'
import { TicketElement, TicketMessage } from 'models/ticket/types'
import VoiceRecordingsProvider from 'pages/integrations/integration/components/voice/VoiceRecordingsProvider'

import {
    useExpandedMessages,
    useGroupedElements,
    useHighlightedElements,
    useKeyboardNavigation,
    useLastMessageDatetimeAfterMount,
} from '../hooks'
import {
    ShoppingAssistantEvent,
    useInsertShoppingAssistantEventElements,
} from '../hooks/useInsertShoppingAssistantEventElements'
import { getVoiceCallIndex } from '../utils'
import MessageQuoteContext from './MessageQuoteContext'
import TicketBodyElement from './TicketBodyElement'

import css from './TicketBody.less'

interface Props {
    customScrollParentRef?: React.RefObject<HTMLDivElement>
    elements: List<any>
    setStatus: (s: string) => void
}

export default function TicketBody({
    customScrollParentRef,
    elements,
    setStatus,
}: Props) {
    const virtuosoRef = useRef<VirtuosoHandle | null>(null)
    const [expandedMessages, toggleMessage] = useExpandedMessages()
    const baseGroupedElements = useGroupedElements()
    const groupedElementsWithShoppingAssistantEvents =
        useInsertShoppingAssistantEventElements(baseGroupedElements)

    const [highlightedElements, setHighlightedElements] =
        useHighlightedElements()
    const lastMessageDatetimeAfterMount =
        useLastMessageDatetimeAfterMount(elements)
    const { call_id: voiceCallId } = useSearch<{ call_id?: string }>()

    const maxIndex = elements.size - 1
    const {
        index: selectedIndex,
        next: nextIndex,
        previous: previousIndex,
    } = useSelectedIndex(maxIndex, { initial: maxIndex })
    useKeyboardNavigation({ next: nextIndex, previous: previousIndex })

    useEffect(() => {
        if (voiceCallId) {
            virtuosoRef.current?.scrollToIndex({
                index: getVoiceCallIndex(
                    voiceCallId,
                    groupedElementsWithShoppingAssistantEvents,
                ),
            })
        }
    }, [groupedElementsWithShoppingAssistantEvents, voiceCallId])

    const virtuosoComponents: Components<
        TicketElement | TicketMessage[] | ShoppingAssistantEvent,
        any
    > = useMemo(
        () => ({
            Item: ({ context: __context, style, children, ...rest }) => (
                <div
                    {...rest}
                    style={{ ...style, minHeight: 1, position: 'relative' }}
                >
                    {children}
                </div>
            ),
        }),
        [],
    )

    const getItemContent = useCallback(
        (
            index: number,
            element: TicketElement | TicketMessage[] | ShoppingAssistantEvent,
        ) => (
            <TicketBodyElement
                element={element}
                hasCursor={selectedIndex === index}
                highlightedElements={highlightedElements}
                index={index}
                isLast={index === elements.size - 1}
                lastMessageDatetimeAfterMount={lastMessageDatetimeAfterMount}
                setHighlightedElements={setHighlightedElements}
                setStatus={setStatus}
            />
        ),
        [
            elements,
            highlightedElements,
            lastMessageDatetimeAfterMount,
            selectedIndex,
            setHighlightedElements,
            setStatus,
        ],
    )

    const messageQuoteContext = useMemo(
        () => ({
            expandedQuotes: expandedMessages,
            toggleQuote: toggleMessage,
        }),
        [expandedMessages, toggleMessage],
    )

    return (
        <VoiceRecordingsProvider
            voiceCallId={voiceCallId ? parseInt(voiceCallId) : null}
        >
            <MessageQuoteContext.Provider value={messageQuoteContext}>
                <Virtuoso<
                    TicketElement | TicketMessage[] | ShoppingAssistantEvent
                >
                    ref={virtuosoRef}
                    className={classnames(css.wrapper)}
                    components={virtuosoComponents}
                    skipAnimationFrameInResizeObserver
                    customScrollParent={
                        customScrollParentRef?.current || undefined
                    }
                    data={groupedElementsWithShoppingAssistantEvents}
                    initialTopMostItemIndex={{
                        index: voiceCallId
                            ? getVoiceCallIndex(
                                  voiceCallId,
                                  groupedElementsWithShoppingAssistantEvents,
                              )
                            : 'LAST',
                    }}
                    itemContent={getItemContent}
                />
            </MessageQuoteContext.Provider>
        </VoiceRecordingsProvider>
    )
}
