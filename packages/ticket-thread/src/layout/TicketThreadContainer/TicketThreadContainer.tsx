import { useCallback, useMemo, useRef } from 'react'

import { useElementSize } from '@repo/hooks'
import type { Components, VirtuosoHandle } from 'react-virtuoso'
import { Virtuoso } from 'react-virtuoso'

import { ExpandedMessagesProvider } from '../../contexts/ExpandedMessages'
import { TicketThreadWidthContext } from '../../contexts/TicketThreadWidth'
import type { TicketThreadItem } from '../../hooks/types'
import { getThreadItemKey } from './utils'

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
    const [measuredWidth] = useElementSize(containerElement ?? null)
    const containerWidth = measuredWidth || Infinity

    const getItemKey = useCallback(
        (index: number, item: TicketThreadItem) =>
            getThreadItemKey(item, index, ticketId),
        [ticketId],
    )

    const virtuosoComponents = useMemo<Components<TicketThreadItem>>(
        () => ({
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

    return (
        <TicketThreadWidthContext.Provider value={{ containerWidth }}>
            <ExpandedMessagesProvider>
                <Virtuoso<TicketThreadItem>
                    ref={ticketThreadRef}
                    aria-label="Ticket thread"
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
