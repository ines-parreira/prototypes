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

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import IconButton from 'pages/common/components/button/IconButton'
import {useSplitTicketView} from 'split-ticket-view-toggle'
import {setViewActive, setViewEditMode} from 'state/views/actions'
import {getViewPlainJS} from 'state/views/selectors'
import type {OnToggleUnreadFn} from 'tickets/pages/SplitTicketPage'

import {TICKET_HEIGHT, TICKET_HEIGHT_NEW} from '../constants'
import useSelection from '../hooks/useSelection'
import useSortOrder from '../hooks/useSortOrder'
import useTickets from '../hooks/useTickets'
import useScrollActiveTicketIntoView from '../hooks/useScrollActiveTicketIntoView'
import {TicketSummary} from '../types'

import SortOrderDropdown from './SortOrderDropdown'
import Ticket from './Ticket'
import TicketListInfo from './TicketListInfo'
import InvalidFiltersAction from './InvalidFiltersAction'
import ViewDecoration from './ViewDecoration'
import css from './TicketListView.less'

export const listInfoProps = {
    DEFAULT: {text: 'No tickets', subText: 'There are no tickets in this view'},
    INVALID_FILTERS: {
        text: 'Invalid filters',
        subText: `This view is deactivated because at least one of its filters is invalid.\nPlease review its filters, and either fix them or delete this view.`,
        action: <InvalidFiltersAction />,
    },
    INACCESSIBLE: {
        text: 'Can’t access view',
        subText:
            'This view does not exist or you do not have the correct permission to access.',
    },
}

type TicketProps = ComponentProps<typeof Ticket>

type Props = {
    activeTicketId?: number
    viewId: number
    registerToggleUnread?: (toggleUnreadFn: OnToggleUnreadFn) => void
}

export default function TicketListView({
    activeTicketId,
    viewId,
    registerToggleUnread,
}: Props) {
    const dispatch = useAppDispatch()
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))
    const areViewFiltersInvalid = !!view?.deactivated_datetime
    const isViewNull = view === null
    const defaultSortOrder = `${view?.order_by || ''}:${view?.order_dir || ''}`
    const [sortOrder, setSortOrder] = useSortOrder(viewId, defaultSortOrder)
    const {
        loadMore,
        setElement,
        tickets,
        newTickets,
        ticketIds,
        initialLoaded,
        pauseUpdates,
        resumeUpdates,
    } = useTickets(viewId, sortOrder, activeTicketId, registerToggleUnread)
    const hasBulkActions = useFlag(FeatureFlagKey.BulkActionsDTP, false)
    const {setIsEnabled: setSplitTicketView, setShouldRedirectToSplitView} =
        useSplitTicketView()

    const {onSelect, selectedTickets} = useSelection(tickets)

    const initialLoadedRef = useRef(initialLoaded)

    const ticketHeight = hasBulkActions ? TICKET_HEIGHT_NEW : TICKET_HEIGHT

    useEffect(() => {
        if (Object.keys(selectedTickets).length) {
            pauseUpdates()
        } else {
            resumeUpdates()
        }
    }, [pauseUpdates, resumeUpdates, selectedTickets])

    useEffect(() => {
        initialLoadedRef.current = initialLoaded
    }, [initialLoaded])

    useEffect(() => {
        view && dispatch(setViewActive(fromJS(view)))
    }, [dispatch, view])

    const getItemContent = useCallback(
        (_index: number, ticket: TicketSummary) => (
            <Ticket
                isActive={ticket.id === activeTicketId}
                ticket={ticket}
                viewId={viewId}
                isNewTicket={!!newTickets[ticket.id]}
                isSelected={!!selectedTickets[ticket.id]}
                onSelect={onSelect}
            />
        ),
        [activeTicketId, viewId, newTickets, onSelect, selectedTickets]
    )

    const setScrollerRef = useCallback(
        (ref: HTMLElement | Window | null) => {
            if (!ref || ref === window) return

            setElement(ref as HTMLElement)
        },
        [setElement]
    )

    const ticketListInfoProps = useMemo(
        () =>
            areViewFiltersInvalid
                ? listInfoProps.INVALID_FILTERS
                : isViewNull
                ? listInfoProps.INACCESSIBLE
                : listInfoProps.DEFAULT,
        [areViewFiltersInvalid, isViewNull]
    )

    const goToViewEdition = useCallback(() => {
        dispatch(setViewEditMode())
        setSplitTicketView(false)
        setShouldRedirectToSplitView(true)
    }, [dispatch, setShouldRedirectToSplitView, setSplitTicketView])

    const virtuosoComponents: Components = {
        Item: ({
            children,
            ...props
        }: Partial<ComponentProps<typeof CSSTransition>> &
            ComponentProps<NonNullable<Components['Item']>>) => (
            <Fragment>
                {Children.map<
                    ReactElement<TicketProps>,
                    ReactElement<TicketProps>
                >(children as ReactElement<TicketProps>, (child) => {
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
                })}
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
                <TicketListInfo {...ticketListInfoProps} />
            ) : null,
    }

    const virtuosoRef = useRef<VirtuosoHandle>(null)
    useScrollActiveTicketIntoView(
        activeTicketId,
        tickets,
        ticketIds,
        virtuosoRef
    )

    return (
        <div className={css.wrapper}>
            <div
                className={
                    hasBulkActions ? css.titleWrapperNew : css.titleWrapper
                }
            >
                <div className={css.viewName}>
                    <ViewDecoration view={view} />
                    <span className={css.title}>{view?.name}</span>
                    <IconButton
                        className={css.icon}
                        intent="secondary"
                        fillStyle="ghost"
                        onClick={goToViewEdition}
                        size="small"
                        title="Edit view"
                    >
                        tune
                    </IconButton>
                </div>
                <SortOrderDropdown onChange={setSortOrder} value={sortOrder} />
            </div>
            <div className={css.list}>
                <Virtuoso
                    ref={virtuosoRef}
                    atBottomThreshold={ticketHeight * 2}
                    className={css.scroller}
                    data={tickets}
                    endReached={loadMore}
                    fixedItemHeight={ticketHeight}
                    itemContent={getItemContent}
                    computeItemKey={(_index, ticket) => ticket.id}
                    scrollerRef={setScrollerRef}
                    components={virtuosoComponents}
                />
            </div>
        </div>
    )
}
