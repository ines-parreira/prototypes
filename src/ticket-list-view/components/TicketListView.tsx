import {fromJS} from 'immutable'
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

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {setViewActive} from 'state/views/actions'
import {getViewPlainJS} from 'state/views/selectors'

import {TICKET_HEIGHT} from '../constants'
import useSortOrder from '../hooks/useSortOrder'
import useTickets from '../hooks/useTickets'
import useScrollActiveTicketIntoView from '../hooks/useScrollActiveTicketIntoView'
import {TicketSummary} from '../types'

import SortOrderDropdown from './SortOrderDropdown'
import Ticket from './Ticket'
import TicketListInfo from './TicketListInfo'
import InvalidFiltersAction from './InvalidFiltersAction'
import css from './TicketListView.less'

type Props = {
    activeTicketId?: number
    viewId: number
}

export const listInfoProps = {
    DEFAULT: {text: 'No tickets', subText: 'There are no tickets in this view'},
    INVALID_FILTERS: {
        text: 'Invalid filters',
        subText: `This view is deactivated because at least one of its filters is invalid.\nPlease review its filters, and either fix them or delete this view.`,
        action: <InvalidFiltersAction />,
    },
}

export default function TicketListView({activeTicketId, viewId}: Props) {
    const dispatch = useAppDispatch()
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))
    const viewEmoji = view?.decoration?.emoji
    const areViewFiltersInvalid = !!view?.deactivated_datetime
    const defaultSortOrder = `${view?.order_by || ''}:${view?.order_dir || ''}`
    const [sortOrder, setSortOrder] = useSortOrder(viewId, defaultSortOrder)
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

    useEffect(() => {
        dispatch(setViewActive(fromJS(view)))
    }, [dispatch, view])

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
                        {...(areViewFiltersInvalid
                            ? listInfoProps.INVALID_FILTERS
                            : listInfoProps.DEFAULT)}
                    />
                ) : null,
        }),
        [ticketIds, areViewFiltersInvalid]
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
                <div className={css.viewName}>
                    {!!viewEmoji && (
                        <span className={css.emoji}>{viewEmoji}</span>
                    )}
                    <span className={css.title}>{view?.name}</span>
                </div>
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
