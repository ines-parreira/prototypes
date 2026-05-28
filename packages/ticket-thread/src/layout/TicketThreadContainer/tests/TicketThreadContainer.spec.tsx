import type * as ReactModule from 'react'

import { render, screen } from '@testing-library/react'
import type { VirtuosoProps } from 'react-virtuoso'

import { TicketThreadItemTag } from '../../../hooks/types'
import type { TicketThreadItem } from '../../../hooks/types'
import { TicketThreadContainer } from '../TicketThreadContainer'

const { mockScrollToIndex } = vi.hoisted(() => ({
    mockScrollToIndex: vi.fn(),
}))

let recordedVirtuosoProps: VirtuosoProps<unknown, unknown>[] = []

vi.mock('react-virtuoso', async () => {
    const React = await vi.importActual<typeof ReactModule>('react')

    const Virtuoso = React.forwardRef(function MockVirtuoso(
        props: VirtuosoProps<unknown, unknown>,
        ref,
    ) {
        React.useImperativeHandle(ref, () => ({
            scrollToIndex: mockScrollToIndex,
        }))
        recordedVirtuosoProps.push(props)
        const EmptyPlaceholder = props.components?.EmptyPlaceholder

        return (
            <div
                aria-label={props['aria-label']}
                className={props.className}
                role={props.role}
                style={props.style}
            >
                {props.data?.length === 0 && EmptyPlaceholder && (
                    <EmptyPlaceholder context={props.context} />
                )}
                {props.data?.map((value, index) => (
                    <div
                        key={
                            props.computeItemKey?.(
                                index,
                                value as never,
                                undefined as never,
                            ) ?? index
                        }
                    >
                        {props.itemContent?.(index, value, undefined as never)}
                    </div>
                ))}
            </div>
        )
    })

    return { Virtuoso }
})

vi.mock('../TicketThreadContainer.less', () => ({
    default: {
        emptyContainer: 'emptyContainer',
    },
}))

describe('TicketThreadContainer', () => {
    const ticketThreadItems = [
        {
            _tag: TicketThreadItemTag.Messages.Message,
            data: { id: 'message-1' } as any,
            datetime: '2024-03-21T11:00:00Z',
        },
        {
            _tag: TicketThreadItemTag.Events.TicketEvent,
            data: { id: 'event-1' } as any,
            datetime: '2024-03-21T11:01:00Z',
        },
    ] as TicketThreadItem[]

    beforeEach(() => {
        recordedVirtuosoProps = []
        mockScrollToIndex.mockClear()
    })

    it('configures Virtuoso to render the thread items inside the provided scroll container', () => {
        const renderThreadItem = vi.fn(
            (index: number, item: { _tag: string }) => (
                <div>{`${index}:${item._tag}`}</div>
            ),
        )
        const containerElement = document.createElement('div')

        render(
            <TicketThreadContainer
                containerElement={containerElement}
                items={ticketThreadItems}
                renderThreadItem={renderThreadItem}
                ticketId="123"
            />,
        )

        expect(
            screen.getByRole('list', { name: 'Ticket thread' }),
        ).toBeInTheDocument()
        expect(screen.getByText('0:message')).toBeInTheDocument()
        expect(screen.getByText('1:ticket-event')).toBeInTheDocument()
        expect(screen.queryByText('2:composer')).not.toBeInTheDocument()
        expect(renderThreadItem).toHaveBeenCalledTimes(2)
        const virtuosoProps =
            recordedVirtuosoProps[recordedVirtuosoProps.length - 1]
        expect(virtuosoProps).toEqual(
            expect.objectContaining({
                ['aria-label']: 'Ticket thread',
                customScrollParent: containerElement,
                data: ticketThreadItems,
                defaultItemHeight: 200,
                increaseViewportBy: { top: 2000, bottom: 0 },
                initialTopMostItemIndex: { index: 'LAST' },
                overscan: { main: 0, reverse: 2000 },
                role: 'list',
                skipAnimationFrameInResizeObserver: true,
            }),
        )

        expect(
            virtuosoProps.computeItemKey?.(0, ticketThreadItems[0], undefined),
        ).toBe('message:message-1:123')
        expect(
            virtuosoProps.computeItemKey?.(1, ticketThreadItems[1], undefined),
        ).toBe('ticket-event:event-1:123')
    })

    it('adds zero-height protection without dropping the item styles provided by Virtuoso', () => {
        render(
            <TicketThreadContainer
                items={ticketThreadItems}
                renderThreadItem={(index, item) => (
                    <div>{`${index}:${item._tag}`}</div>
                )}
                ticketId="123"
            />,
        )

        const virtuosoProps = recordedVirtuosoProps[0]
        const Item = virtuosoProps.components?.Item

        expect(Item).toBeDefined()

        if (!Item) {
            throw new Error('Expected a Virtuoso item component to be defined')
        }

        render(
            <Item
                context={undefined}
                data-index={0}
                data-item-index={0}
                data-known-size={16}
                item={ticketThreadItems[0]}
                style={{ top: 16 }}
            >
                <div>Item child</div>
            </Item>,
        )

        const outerItem = screen.getByText('Item child').parentElement

        expect(outerItem).toHaveStyle({
            minHeight: '0.5px',
            top: '16px',
        })
    })

    it('scrolls to the last item when thread items become available after initial mount', () => {
        const containerElement = document.createElement('div')

        const { rerender } = render(
            <TicketThreadContainer
                containerElement={containerElement}
                items={[]}
                renderThreadItem={(index, item) => (
                    <div>{`${index}:${item._tag}`}</div>
                )}
                ticketId="123"
            />,
        )

        expect(mockScrollToIndex).not.toHaveBeenCalled()

        rerender(
            <TicketThreadContainer
                containerElement={containerElement}
                items={ticketThreadItems}
                renderThreadItem={(index, item) => (
                    <div>{`${index}:${item._tag}`}</div>
                )}
                ticketId="123"
            />,
        )

        expect(mockScrollToIndex).toHaveBeenCalledTimes(1)
        expect(mockScrollToIndex).toHaveBeenCalledWith({ index: 'LAST' })

        rerender(
            <TicketThreadContainer
                containerElement={containerElement}
                items={[
                    ...ticketThreadItems,
                    {
                        _tag: TicketThreadItemTag.Events.TicketEvent,
                        data: { id: 'event-2' } as any,
                        datetime: '2024-03-21T11:02:00Z',
                    } as TicketThreadItem,
                ]}
                renderThreadItem={(index, item) => (
                    <div>{`${index}:${item._tag}`}</div>
                )}
                ticketId="123"
            />,
        )

        expect(mockScrollToIndex).toHaveBeenCalledTimes(1)
    })

    it('renders the centered loader as the empty placeholder when there are no items', () => {
        render(
            <TicketThreadContainer
                items={[]}
                renderThreadItem={(index, item) => (
                    <div>{`${index}:${item._tag}`}</div>
                )}
                ticketId="123"
            />,
        )

        expect(
            screen.getByRole('progressbar', {
                name: 'Loading ticket thread',
            }),
        ).toBeInTheDocument()

        const virtuosoProps =
            recordedVirtuosoProps[recordedVirtuosoProps.length - 1]
        expect(virtuosoProps.className).toEqual(expect.any(String))
    })

    it('removes the empty placeholder loader once items are available', () => {
        const { rerender } = render(
            <TicketThreadContainer
                items={[]}
                renderThreadItem={(index, item) => (
                    <div>{`${index}:${item._tag}`}</div>
                )}
                ticketId="123"
            />,
        )

        expect(
            screen.getByRole('progressbar', {
                name: 'Loading ticket thread',
            }),
        ).toBeInTheDocument()

        rerender(
            <TicketThreadContainer
                items={ticketThreadItems}
                renderThreadItem={(index, item) => (
                    <div>{`${index}:${item._tag}`}</div>
                )}
                ticketId="123"
            />,
        )

        expect(
            screen.queryByRole('progressbar', {
                name: 'Loading ticket thread',
            }),
        ).not.toBeInTheDocument()

        const virtuosoProps =
            recordedVirtuosoProps[recordedVirtuosoProps.length - 1]
        expect(virtuosoProps.className).toBeUndefined()
    })

    it('keeps the same key for an existing item after a new row is inserted', () => {
        const insertedEvent = {
            _tag: TicketThreadItemTag.Events.TicketEvent,
            data: { id: 'event-2' } as any,
            datetime: '2024-03-21T10:59:00Z',
        } as TicketThreadItem

        const { rerender } = render(
            <TicketThreadContainer
                items={ticketThreadItems}
                renderThreadItem={(index, item) => (
                    <div>{`${index}:${item._tag}`}</div>
                )}
                ticketId="123"
            />,
        )

        const initialVirtuosoProps =
            recordedVirtuosoProps[recordedVirtuosoProps.length - 1]
        const initialMessageKey = initialVirtuosoProps.computeItemKey?.(
            0,
            ticketThreadItems[0],
            undefined,
        )

        rerender(
            <TicketThreadContainer
                items={[insertedEvent, ...ticketThreadItems]}
                renderThreadItem={(index, item) => (
                    <div>{`${index}:${item._tag}`}</div>
                )}
                ticketId="123"
            />,
        )

        const rerenderedVirtuosoProps =
            recordedVirtuosoProps[recordedVirtuosoProps.length - 1]
        const rerenderedMessageKey = rerenderedVirtuosoProps.computeItemKey?.(
            1,
            ticketThreadItems[0],
            undefined,
        )

        expect(rerenderedMessageKey).toBe(initialMessageKey)
    })
})
