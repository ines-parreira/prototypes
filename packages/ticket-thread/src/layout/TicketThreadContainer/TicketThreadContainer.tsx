import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useElementSize } from '@repo/hooks'
import type { Components, VirtuosoHandle } from 'react-virtuoso'
import { Virtuoso } from 'react-virtuoso'

import { ExpandedMessagesProvider } from '../../contexts/ExpandedMessages'
import { TicketThreadWidthContext } from '../../contexts/TicketThreadWidth'
import type { TicketThreadItem } from '../../hooks/types'
import { TicketThreadEmptyPlaceholder } from './TicketThreadEmptyPlaceholder'
import { getThreadItemKey } from './utils'
import css from './TicketThreadContainer.less'

type TicketThreadContainerProps = {
    items: TicketThreadItem[]
    ticketId: string
    containerElement?: HTMLElement | null
    renderThreadItem: (index: number, item: TicketThreadItem) => React.ReactNode
}

export function TicketThreadContainer({
    ticketId,
    items,
    containerElement,
    renderThreadItem,
}: TicketThreadContainerProps) {
    const ticketThreadRef = useRef<VirtuosoHandle>(null)
    const appliedInitialScrollRef = useRef<string | null>(null)
    const [measuredWidth] = useElementSize(containerElement ?? null)
    const containerWidth = measuredWidth || Infinity
    const isEmpty = items.length === 0

    const getItemKey = useCallback(
        (index: number, item: TicketThreadItem) =>
            getThreadItemKey(item, index, ticketId),
        [ticketId],
    )
    const virtuosoComponents = useMemo<Components<TicketThreadItem>>(
        () => ({
            EmptyPlaceholder: TicketThreadEmptyPlaceholder,
            Item: ({
                context: __context,
                item: __item,
                children,
                style,
                ...props
            }) => (
                <div
                    {...props}
                    /**
                     * This prevent the error: "Zero-sized element this should not happen"
                     * https://virtuoso.dev/react-virtuoso/troubleshooting/#i-get-error-zero-sized-element-this-should-not-happen
                     * We do this since we don't want to filter out elements, like some events that we don't always show
                     * because inserting/removing elements in the middle of the list can cause the list to jump.
                     * Whereas only expanding the size of elements is much more stable.
                     */
                    style={{ ...style, minHeight: 0.5 }}
                >
                    {children}
                </div>
            ),
        }),
        [],
    )

    useEffect(() => {
        const isReady = containerElement && items.length > 0
        const isScrollApplied = appliedInitialScrollRef.current === ticketId
        if (!isReady || isScrollApplied) {
            return
        }

        ticketThreadRef.current?.scrollToIndex({ index: 'LAST' })
        appliedInitialScrollRef.current = ticketId
    }, [containerElement, items.length, ticketId])

    return (
        <TicketThreadWidthContext.Provider value={{ containerWidth }}>
            <ExpandedMessagesProvider>
                <Virtuoso<TicketThreadItem>
                    ref={ticketThreadRef}
                    aria-label="Ticket thread"
                    className={isEmpty ? css.emptyContainer : undefined}
                    components={virtuosoComponents}
                    computeItemKey={getItemKey}
                    customScrollParent={containerElement ?? undefined}
                    data={items}
                    defaultItemHeight={200}
                    initialTopMostItemIndex={{ index: 'LAST' }}
                    itemContent={renderThreadItem}
                    role="list"
                    skipAnimationFrameInResizeObserver
                    increaseViewportBy={{ top: 2000, bottom: 0 }}
                    overscan={{ reverse: 2000, main: 0 }}
                />
            </ExpandedMessagesProvider>
        </TicketThreadWidthContext.Provider>
    )
}
