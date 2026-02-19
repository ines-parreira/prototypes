import type { ComponentProps, ReactElement } from 'react'
import {
    Children,
    cloneElement,
    forwardRef,
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react'

import {
    useCurrentUserLanguagePreferences,
    useTicketsTranslatedProperties,
} from '@repo/tickets'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import cn from 'classnames'
import { fromJS } from 'immutable'
import type { CSSTransition } from 'react-transition-group'
import { TransitionGroup } from 'react-transition-group'
import type { Components, VirtuosoHandle } from 'react-virtuoso'
import { Virtuoso } from 'react-virtuoso'

import {
    LegacyIconButton as IconButton,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import type { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import CheckBox from 'pages/common/forms/CheckBox'
import {
    SplitTicketViewToggle,
    useSplitTicketView,
} from 'split-ticket-view-toggle'
import { setViewActive, setViewEditMode } from 'state/views/actions'
import { getViewCount, getViewPlainJS } from 'state/views/selectors'
import type { OnToggleUnreadFn } from 'tickets/dtp'

import { TICKET_HEIGHT } from '../constants'
import useScrollActiveTicketIntoView from '../hooks/useScrollActiveTicketIntoView'
import useSelection from '../hooks/useSelection'
import useSortOrder from '../hooks/useSortOrder'
import useTickets from '../hooks/useTickets'
import type { TicketCompact } from '../types'
import BulkActions from './bulk-actions/BulkActions'
import { Action } from './bulk-actions/types'
import InvalidFiltersAction from './InvalidFiltersAction'
import SortOrderDropdown from './SortOrderDropdown'
import Ticket from './Ticket'
import TicketListInfo from './TicketListInfo'
import ViewDecoration from './ViewDecoration'

import css from './TicketListView.less'

export const listInfoProps = {
    DEFAULT: {
        text: 'No tickets',
        subText: 'There are no tickets in this view',
    },
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
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()
    const dispatch = useAppDispatch()
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))
    const viewCount = useAppSelector(getViewCount(viewId))
    const editViewRef = useRef(null)
    const areViewFiltersInvalid = !!view?.deactivated_datetime
    const isViewNull = view === null
    const defaultSortOrder =
        `${view?.order_by || ''}:${view?.order_dir || ''}` as ListViewItemsUpdatesOrderBy
    const [sortOrder, setSortOrder] = useSortOrder(viewId, defaultSortOrder)
    const prevSortOrder = useRef<ListViewItemsUpdatesOrderBy | undefined>(
        sortOrder,
    )
    const {
        bulkToggleUnread,
        loadMore,
        setElement,
        tickets,
        newTickets,
        ticketIds,
        initialLoaded,
        pauseUpdates,
        resumeUpdates,
        partials,
    } = useTickets(viewId, sortOrder, activeTicketId, registerToggleUnread)

    const ticketIdsToFetchTranslationsFor = useMemo(
        () => partials.map((partial) => partial.id),
        [partials],
    )

    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const { translationMap } = useTicketsTranslatedProperties({
        ticket_ids: ticketIdsToFetchTranslationsFor,
    })

    const { setIsEnabled: setSplitTicketView, setShouldRedirectToSplitView } =
        useSplitTicketView()

    const { hasSelectedAll, onSelect, onSelectAll, selectedTickets, clear } =
        useSelection(tickets)

    const initialLoadedRef = useRef(initialLoaded)

    useEffect(() => {
        if (hasSelectedAll || Object.keys(selectedTickets).length) {
            pauseUpdates()
        } else {
            resumeUpdates()
        }
    }, [hasSelectedAll, pauseUpdates, resumeUpdates, selectedTickets])

    useEffect(() => {
        if (prevSortOrder.current === sortOrder) return
        prevSortOrder.current = sortOrder
        clear()
    }, [clear, sortOrder])

    useEffect(() => {
        initialLoadedRef.current = initialLoaded
    }, [initialLoaded])

    useEffect(() => {
        view && dispatch(setViewActive(fromJS(view)))
    }, [dispatch, view])

    const getItemContent = useCallback(
        (_index: number, ticket: TicketCompact) => (
            <Ticket
                isActive={ticket.id === activeTicketId}
                ticket={ticket}
                viewId={viewId}
                isNewTicket={!!newTickets[ticket.id]}
                isSelected={hasSelectedAll || !!selectedTickets[ticket.id]}
                onSelect={onSelect}
                translation={translationMap[ticket.id]}
                shouldShowTranslatedContent={shouldShowTranslatedContent}
            />
        ),
        [
            activeTicketId,
            hasSelectedAll,
            newTickets,
            onSelect,
            selectedTickets,
            viewId,
            translationMap,
            shouldShowTranslatedContent,
        ],
    )

    const setScrollerRef = useCallback(
        (ref: HTMLElement | Window | null) => {
            if (!ref || ref === window) return

            setElement(ref as HTMLElement)
        },
        [setElement],
    )

    const ticketListInfoProps = useMemo(
        () =>
            areViewFiltersInvalid
                ? listInfoProps.INVALID_FILTERS
                : isViewNull
                  ? listInfoProps.INACCESSIBLE
                  : listInfoProps.DEFAULT,
        [areViewFiltersInvalid, isViewNull],
    )

    const goToViewEdition = useCallback(() => {
        dispatch(setViewEditMode())
        setSplitTicketView(false)
        setShouldRedirectToSplitView(true)
    }, [dispatch, setShouldRedirectToSplitView, setSplitTicketView])

    const onCompleteBulkAction = useCallback(
        (action?: Action) => {
            if (
                action === Action.MarkAsRead ||
                action === Action.MarkAsUnread
            ) {
                bulkToggleUnread(
                    Object.keys(selectedTickets).map(Number),
                    action === Action.MarkAsUnread,
                )
            }

            clear()
        },
        [bulkToggleUnread, clear, selectedTickets],
    )

    const virtuosoComponents: Components<TicketCompact, any> = {
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
                                  child.props.ticket?.id,
                              ),
                    })
                })}
            </Fragment>
        ),
        List: forwardRef<HTMLDivElement>(({ children, ...props }, ref) => (
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
        virtuosoRef,
    )

    const selectionCount = useMemo(
        () =>
            hasSelectedAll ? viewCount : Object.keys(selectedTickets).length,
        [hasSelectedAll, selectedTickets, viewCount],
    )

    return (
        <div className={css.wrapper}>
            <div className={css.titleWrapper}>
                <div
                    className={cn(css.headerLeft, {
                        [css.headerLeftMS1Spacing]: hasUIVisionMS1,
                    })}
                >
                    <SplitTicketViewToggle />
                    <div className={css.titleAndViewDecorationWrapper}>
                        <ViewDecoration view={view} />
                        <span className={css.title}>{view?.name}</span>
                    </div>
                </div>
                <div className={cn(css.headerRight, css.buttons)}>
                    <IconButton
                        ref={editViewRef}
                        className={css.icon}
                        intent="secondary"
                        fillStyle="ghost"
                        onClick={goToViewEdition}
                        icon="tune"
                    />

                    <Tooltip target={editViewRef} innerProps={{ fade: false }}>
                        Edit view
                    </Tooltip>
                    <SortOrderDropdown
                        onChange={setSortOrder}
                        value={sortOrder}
                    />
                </div>
            </div>
            {viewCount !== 0 && (
                <div className={css.subHeader}>
                    <div className={css.selection}>
                        <CheckBox
                            isChecked={hasSelectedAll}
                            onChange={onSelectAll}
                        >
                            {hasSelectedAll ||
                            Object.keys(selectedTickets).length > 0 ? (
                                <>{selectionCount ?? '?'} selected</>
                            ) : (
                                <>Select all</>
                            )}
                        </CheckBox>
                    </div>
                    <BulkActions
                        hasSelectedAll={hasSelectedAll}
                        selectedTickets={selectedTickets}
                        onComplete={onCompleteBulkAction}
                        selectionCount={selectionCount}
                    />
                </div>
            )}
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
