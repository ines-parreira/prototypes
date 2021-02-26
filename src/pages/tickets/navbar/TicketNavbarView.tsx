import classnames from 'classnames'
import {fromJS} from 'immutable'
import React, {useMemo, useRef} from 'react'
import {useDrag} from 'react-dnd'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'

import {UserRole} from '../../../config/types/user'
import {MAX_TICKET_COUNT_PER_VIEW} from '../../../config/views'
import {View, ViewVisibility} from '../../../models/view/types'
import {RootState} from '../../../state/types'
import {activeViewIdSet} from '../../../state/ui/views/actions'
import {hasRole} from '../../../utils'
import ViewCount from '../../common/components/ViewCount/index.js'
import ViewName from '../../common/components/ViewName/ViewName'

import {TicketNavbarElementType} from './TicketNavbar'
import css from './TicketNavbarView.less'
import TicketNavbarDropTarget from './TicketNavbarDropTarget'

type OwnProps = {
    className?: string
    view: View
}

export type ViewItem = {
    id: number
    type: string
}

export function TicketNavbarViewContainer({
    activeViewId,
    activeViewIdSet,
    className,
    currentUser,
    sections,
    view,
    views,
    viewsCount,
}: OwnProps & ConnectedProps<typeof connector>) {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const count = viewsCount[view.id] || 0
    const ticketNavbarId = `ticket-navbar-view-${view.id}`

    const canDrag = useMemo(
        () =>
            view.visibility === ViewVisibility.Private ||
            hasRole(currentUser, UserRole.Agent),
        [currentUser, view]
    )
    const [{isDragging}, drag] = useDrag({
        item: {
            id: view.id,
            type: TicketNavbarElementType.View,
        },
        canDrag,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    drag(wrapperRef)
    return (
        <TicketNavbarDropTarget
            accept={Object.values(TicketNavbarElementType)}
            canDrop={(item) => {
                if (
                    item.type === TicketNavbarElementType.Section &&
                    view.section_id != null
                ) {
                    return false
                }
                const dragTargetVisibility =
                    item.type === TicketNavbarElementType.View
                        ? views[item.id].visibility
                        : sections[item.id].private
                        ? ViewVisibility.Private
                        : ViewVisibility.Public

                return view.visibility !== ViewVisibility.Private
                    ? dragTargetVisibility !== ViewVisibility.Private
                    : dragTargetVisibility === ViewVisibility.Private
            }}
            className={classnames(css.view, className)}
            onDrop={(item, monitor, direction) => ({
                sectionId: view.section_id,
                viewId: view.id,
                direction,
            })}
            topIndicatorClassName={
                view.section_id != null ? css.nestedViewIndicator : undefined
            }
            bottomIndicatorClassName={
                view.section_id != null ? css.nestedViewIndicator : undefined
            }
        >
            {(isOver) => {
                return (
                    <div id={ticketNavbarId} ref={wrapperRef}>
                        <Link
                            className={classnames('item', {
                                active: view.id === activeViewId && !isOver,
                                focused:
                                    window.location.pathname.startsWith(
                                        `/app/tickets/${view.id}/`
                                    ) && !isOver,
                                [css.isDragged]: isDragging,
                            })}
                            title={`${view.name} ${
                                count >= MAX_TICKET_COUNT_PER_VIEW
                                    ? `${MAX_TICKET_COUNT_PER_VIEW - 1}+`
                                    : count
                            }`}
                            to={`/app/tickets/${view.id}/${encodeURIComponent(
                                view.slug
                            )}`}
                            onClick={() => activeViewIdSet(view.id)}
                        >
                            <span
                                className={classnames(
                                    css.viewName,
                                    'item-name flex-grow'
                                )}
                            >
                                <ViewName view={fromJS(view)} />
                            </span>
                            <span className="item-count">
                                {/*$TsFixMe remove once ViewCount is migrated*/}
                                {/*@ts-ignore*/}
                                <ViewCount view={fromJS(view)} />
                            </span>
                        </Link>
                    </div>
                )
            }}
        </TicketNavbarDropTarget>
    )
}

const connector = connect(
    (state: RootState) => ({
        activeViewId: state.ui.views.activeViewId,
        currentUser: state.currentUser,
        sections: state.entities.sections,
        views: state.entities.views,
        viewsCount: state.entities.viewsCount,
    }),
    {
        activeViewIdSet,
    }
)

export default connector(TicketNavbarViewContainer)
