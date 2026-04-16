import type { ForwardedRef } from 'react'
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react'

import { useElementSize } from '@repo/hooks'
import type { Components, VirtuosoHandle } from 'react-virtuoso'
import { Virtuoso } from 'react-virtuoso'

import { ExpandedMessagesProvider } from '../../contexts/ExpandedMessages'
import { TicketThreadWidthContext } from '../../contexts/TicketThreadWidth'
import type { TicketThreadItem } from '../../hooks/types'
import type { TicketThreadVirtualizedListItem } from './utils'
import { composerItem, getThreadListItemKey } from './utils'

import css from './TicketThreadContainer.less'

type TicketThreadContainerProps = {
    items: TicketThreadItem[]
    ticketId: string
    renderThreadItem: (
        index: number,
        item: TicketThreadVirtualizedListItem,
    ) => React.ReactNode
}

export function TicketThreadContainer({
    ticketId,
    items,
    renderThreadItem,
}: TicketThreadContainerProps) {
    const ticketThreadRef = useRef<VirtuosoHandle>(null)
    const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null)
    const [measuredWidth] = useElementSize(containerEl)
    const containerWidth = measuredWidth || Infinity

    const virtualizedItems = useMemo<TicketThreadVirtualizedListItem[]>(
        () => [...items, composerItem],
        [items],
    )

    const getItemKey = useCallback(
        (index: number, item: TicketThreadVirtualizedListItem) =>
            getThreadListItemKey(item, index, ticketId, items.length),
        [ticketId, items.length],
    )

    const virtuosoComponents = useMemo<
        Components<TicketThreadVirtualizedListItem>
    >(
        () => ({
            Item: ({
                context: __context,
                item: __item,
                children,
                ...props
            }) => (
                <div
                    {...props}
                    style={{
                        paddingTop: 'var(--spacing-xxxs)',
                        paddingBottom: 'var(--spacing-xxxs)',
                    }}
                >
                    {children}
                </div>
            ),
            List: forwardRef(function TicketThreadList(
                { context: __context, style, children, ...props },
                ref: ForwardedRef<HTMLDivElement>,
            ) {
                return (
                    <div {...props} ref={ref} style={style}>
                        {children}
                    </div>
                )
            }),
        }),
        [],
    )

    return (
        <TicketThreadWidthContext.Provider value={{ containerWidth }}>
            <ExpandedMessagesProvider>
                <div ref={setContainerEl} className={css.threadItemsList}>
                    <Virtuoso<TicketThreadVirtualizedListItem>
                        ref={ticketThreadRef}
                        alignToBottom
                        aria-label="Ticket thread"
                        className={css.threadItems}
                        components={virtuosoComponents}
                        computeItemKey={getItemKey}
                        data={virtualizedItems}
                        defaultItemHeight={200}
                        initialTopMostItemIndex={{ index: 'LAST' }}
                        itemContent={renderThreadItem}
                        role="list"
                        skipAnimationFrameInResizeObserver
                        increaseViewportBy={{ top: 2000, bottom: 0 }}
                        overscan={{ reverse: 2000, main: 0 }}
                    />
                </div>
            </ExpandedMessagesProvider>
        </TicketThreadWidthContext.Provider>
    )
}
