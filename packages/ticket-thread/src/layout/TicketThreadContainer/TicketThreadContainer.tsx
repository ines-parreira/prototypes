import type { ForwardedRef } from 'react'
import { forwardRef, useCallback, useMemo, useRef } from 'react'

import type { Components, VirtuosoHandle } from 'react-virtuoso'
import { Virtuoso } from 'react-virtuoso'

import { ExpandedMessagesProvider } from '../../contexts/ExpandedMessages'
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
            }) => <div {...props}>{children}</div>,
            List: forwardRef(function TicketThreadList(
                { context: __context, style, children, ...props },
                ref: ForwardedRef<HTMLDivElement>,
            ) {
                return (
                    <div
                        {...props}
                        ref={ref}
                        style={{
                            ...style,
                            boxSizing: 'border-box',
                        }}
                    >
                        <div className={css.threadItemsList}>{children}</div>
                    </div>
                )
            }),
        }),
        [],
    )

    return (
        <ExpandedMessagesProvider>
            <Virtuoso<TicketThreadVirtualizedListItem>
                ref={ticketThreadRef}
                key={ticketId}
                alignToBottom
                aria-label="Ticket thread"
                className={css.threadItems}
                components={virtuosoComponents}
                computeItemKey={getItemKey}
                data={virtualizedItems}
                defaultItemHeight={160}
                initialTopMostItemIndex={{ index: 'LAST' }}
                itemContent={renderThreadItem}
                role="list"
                skipAnimationFrameInResizeObserver
                increaseViewportBy={{ top: 2000, bottom: 0 }}
                overscan={{ reverse: 2000, main: 0 }}
            />
        </ExpandedMessagesProvider>
    )
}
