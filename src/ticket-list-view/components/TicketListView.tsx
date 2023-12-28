import React, {
    Children,
    cloneElement,
    ComponentProps,
    forwardRef,
    Fragment,
    ReactElement,
    ReactNode,
    useCallback,
    useMemo,
} from 'react'
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import {Components, Virtuoso} from 'react-virtuoso'

import useAppSelector from 'hooks/useAppSelector'
import {getViewPlainJS} from 'state/views/selectors'

import {TICKET_HEIGHT} from '../constants'
import useTickets from '../hooks/useTickets'
import {TicketSummary} from '../types'

import Ticket from './Ticket'
import css from './TicketListView.less'

type Props = {
    viewId: number
}

export default function TicketListView({viewId}: Props) {
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))
    const {loadMore, setElement, tickets} = useTickets(viewId)

    const getItemContent = useCallback(
        (_index: number, ticket: TicketSummary) => (
            <Ticket ticket={ticket} viewId={viewId} />
        ),
        [viewId]
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
            }: {children?: ReactNode} & Partial<
                ComponentProps<typeof CSSTransition>
            > &
                ComponentProps<NonNullable<Components['Item']>>) => (
                <Fragment>
                    {Children.map(children, (child) =>
                        cloneElement(child as ReactElement, props)
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
        }),
        []
    )

    return (
        <div className={css.wrapper}>
            <div className={css.titleWrapper}>
                <div className={css.title}>{view?.name}</div>
            </div>
            <div className={css.list}>
                <Virtuoso
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
