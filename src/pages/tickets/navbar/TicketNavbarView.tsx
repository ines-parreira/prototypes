import classnames from 'classnames'
import React, {useMemo, useRef} from 'react'
import {useDrag} from 'react-dnd'

import navbarCss from 'assets/css/navbar.less'
import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {View, ViewVisibility} from 'models/view/types'
import {TicketNavbarElementType} from 'state/ui/ticketNavbar/types'
import {getActiveView} from 'state/views/selectors'
import {hasRole} from 'utils'

import css from './TicketNavbarView.less'
import TicketNavbarDropTarget from './TicketNavbarDropTarget'
import TicketNavbarViewLink from './TicketNavbarViewLink'

type Props = {
    className?: string
    view: View
    viewCount: number | undefined
}

const TicketNavbarView = ({className, view, viewCount}: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const activeView = useAppSelector(getActiveView)
    const currentUser = useAppSelector((state) => state.currentUser)
    const sections = useAppSelector((state) => state.entities.sections)
    const views = useAppSelector((state) => state.entities.views)

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
            accept={[
                TicketNavbarElementType.View,
                TicketNavbarElementType.Section,
            ]}
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
                    <TicketNavbarViewLink
                        ref={wrapperRef}
                        view={view}
                        viewCount={viewCount}
                        className={classnames({
                            active: view.id === activeView.get('id') && !isOver,
                            [navbarCss.isDragged]: isDragging,
                        })}
                    />
                )
            }}
        </TicketNavbarDropTarget>
    )
}

export default TicketNavbarView
