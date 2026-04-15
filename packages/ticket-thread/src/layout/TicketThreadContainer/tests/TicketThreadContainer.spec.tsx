import type * as ReactModule from 'react'

import { render, screen } from '@testing-library/react'
import type { VirtuosoProps } from 'react-virtuoso'

import { TicketThreadItemTag } from '../../../hooks/types'
import type { TicketThreadItem } from '../../../hooks/types'
import { TicketThreadContainer } from '../TicketThreadContainer'

let recordedVirtuosoProps: VirtuosoProps<unknown, unknown>[] = []

vi.mock('react-virtuoso', async () => {
    const React = await vi.importActual<typeof ReactModule>('react')

    const Virtuoso = React.forwardRef(function MockVirtuoso(
        props: VirtuosoProps<unknown, unknown>,
        __ref,
    ) {
        recordedVirtuosoProps.push(props)

        return (
            <div
                aria-label={props['aria-label']}
                className={props.className}
                role={props.role}
                style={props.style}
            >
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
    })

    it('configures Virtuoso and appends the composer as the last item', () => {
        const renderThreadItem = vi.fn(
            (index: number, item: { _tag: string }) => (
                <div>{`${index}:${item._tag}`}</div>
            ),
        )

        render(
            <TicketThreadContainer
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
        expect(screen.getByText('2:composer')).toBeInTheDocument()
        expect(renderThreadItem).toHaveBeenCalledTimes(3)
        expect(renderThreadItem).toHaveBeenNthCalledWith(
            3,
            2,
            expect.objectContaining({ _tag: 'composer' }),
            undefined,
        )
        expect(recordedVirtuosoProps).toHaveLength(1)
        expect(recordedVirtuosoProps[0]).toEqual(
            expect.objectContaining({
                alignToBottom: true,
                ['aria-label']: 'Ticket thread',
                data: [
                    ticketThreadItems[0],
                    ticketThreadItems[1],
                    expect.objectContaining({ _tag: 'composer' }),
                ],
                defaultItemHeight: 200,
                increaseViewportBy: { top: 2000, bottom: 0 },
                initialTopMostItemIndex: { index: 'LAST' },
                overscan: { main: 0, reverse: 2000 },
                role: 'list',
                skipAnimationFrameInResizeObserver: true,
            }),
        )

        const virtuosoProps = recordedVirtuosoProps[0]

        expect(
            virtuosoProps.computeItemKey?.(0, ticketThreadItems[0], undefined),
        ).toBe('message:message-1:123:0')
        expect(
            virtuosoProps.computeItemKey?.(
                2,
                { _tag: 'composer', data: null },
                undefined,
            ),
        ).toBe('composer:2:123')
    })

    it('forwards list children and adds item spacing wrappers', () => {
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
        const List = virtuosoProps.components?.List
        const Item = virtuosoProps.components?.Item

        expect(List).toBeDefined()
        expect(Item).toBeDefined()

        if (!List || !Item) {
            throw new Error('Expected Virtuoso list components to be defined')
        }

        render(
            <>
                <List
                    context={undefined}
                    data-testid="thread-list"
                    style={{ paddingBottom: 12 }}
                >
                    <div>List child</div>
                </List>
                <Item
                    context={undefined}
                    data-index={0}
                    data-item-index={0}
                    data-known-size={16}
                    item={ticketThreadItems[0]}
                    style={{ top: 16 }}
                >
                    <div>Item child</div>
                </Item>
            </>,
        )

        const child = screen.getByText('List child')
        const outerList = child.parentElement
        const outerItem = screen.getByText('Item child').parentElement

        expect(outerList).toHaveStyle({
            paddingBottom: '12px',
        })
        expect(outerList).toContainElement(child)
        expect(outerItem).toHaveStyle({
            paddingBottom: 'var(--spacing-xxxs)',
            paddingTop: 'var(--spacing-xxxs)',
        })
    })
})
