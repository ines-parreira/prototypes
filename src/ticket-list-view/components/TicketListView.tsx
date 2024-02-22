import React, {
    Children,
    cloneElement,
    ComponentProps,
    forwardRef,
    Fragment,
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react'
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import {Components, Virtuoso, VirtuosoHandle} from 'react-virtuoso'

import useAppSelector from 'hooks/useAppSelector'
import {getViewPlainJS} from 'state/views/selectors'

import {TICKET_HEIGHT} from '../constants'
import useSortOrder from '../hooks/useSortOrder'
import useTickets from '../hooks/useTickets'
import useScrollActiveTicketIntoView from '../hooks/useScrollActiveTicketIntoView'
import {TicketSummary} from '../types'

import SortOrderDropdown from './SortOrderDropdown'
import Ticket from './Ticket'
import TicketListInfo from './TicketListInfo'
import css from './TicketListView.less'

type Props = {
    activeTicketId?: number
    viewId: number
}

export default function TicketListView({activeTicketId, viewId}: Props) {
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))
    const defaultSortOrder = `${view?.order_by || ''}:${view?.order_dir || ''}`
    const [sortOrder, setSortOrder] = useSortOrder(defaultSortOrder)
    const {
        loadMore,
        setElement,
        tickets,
        newTickets,
        ticketIds,
        initialLoaded,
    } = useTickets(viewId, sortOrder, activeTicketId)

    const initialLoadedRef = useRef(initialLoaded)
    useEffect(() => {
        initialLoadedRef.current = initialLoaded
    }, [initialLoaded])

    const getItemContent = useCallback(
        (_index: number, ticket: TicketSummary) => (
            <Ticket
                isActive={ticket.id === activeTicketId}
                ticket={ticket}
                viewId={viewId}
                isNewTicket={!!newTickets[ticket.id]}
            />
        ),
        [activeTicketId, viewId, newTickets]
    )

    const setScrollerRef = useCallback(
        (ref: HTMLElement | Window | null) => {
            if (!ref || ref === window) return

            setElement(ref as HTMLElement)
        },
        [setElement]
    )

    const virtuosoComponents: Components = useMemo(
        () => ({
            Item: ({
                children,
                ...props
            }: Partial<ComponentProps<typeof CSSTransition>> &
                ComponentProps<NonNullable<Components['Item']>>) => (
                <Fragment>
                    {Children.map<
                        ReactElement<ComponentProps<typeof Ticket>>,
                        ReactElement<ComponentProps<typeof Ticket>>
                    >(
                        children as ReactElement<ComponentProps<typeof Ticket>>,
                        (child) => {
                            const isVisible = props.in

                            return cloneElement(child, {
                                ...props,
                                exit: isVisible
                                    ? false
                                    : !!ticketIds.current?.length &&
                                      !ticketIds.current.includes(
                                          child.props.ticket?.id
                                      ),
                            })
                        }
                    )}
                </Fragment>
            ),
            List: forwardRef<HTMLDivElement>(({children, ...props}, ref) => (
                <div ref={ref} {...props}>
                    <TransitionGroup component={Fragment}>
                        {children as Array<ReactElement>}
                    </TransitionGroup>
                </div>
            )),
            EmptyPlaceholder: () =>
                initialLoadedRef.current ? (
                    <TicketListInfo
                        text="No tickets"
                        subText="There are no tickets in this view"
                    />
                ) : null,
        }),
        [ticketIds]
    )

    const virtuosoRef = useRef<VirtuosoHandle>(null)
    useScrollActiveTicketIntoView(
        activeTicketId,
        tickets,
        ticketIds,
        virtuosoRef
    )

    return (
        <div className={css.wrapper}>
            <div className={css.titleWrapper}>
                <div className={css.title}>{view?.name}</div>
                <SortOrderDropdown onChange={setSortOrder} value={sortOrder} />
            </div>
            <div className={css.list}>
                <Virtuoso
                    ref={virtuosoRef}
                    atBottomThreshold={TICKET_HEIGHT * 2}
                    className={css.scroller}
                    data={tickets}
                    endReached={loadMore}
                    fixedItemHeight={TICKET_HEIGHT}
                    itemContent={getItemContent}
                    computeItemKey={(_index, ticket) => ticket.id}
                    scrollerRef={setScrollerRef}
                    components={virtuosoComponents}
                />
            </div>
        </div>
    )
}
