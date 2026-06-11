import { useCallback, useRef } from 'react'

import { NavigationSection } from '@repo/navigation'
import { hasRole, UserRole } from '@repo/permissions'
import { TicketSectionActionsMenu } from '@repo/tickets'
import { addCanduLinkForValidViewOrSection } from '@repo/tickets/utils/views'
import classnames from 'classnames'
import type { DropTargetMonitor } from 'react-dnd'
import { useDrag } from 'react-dnd'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'

import { Box } from '@gorgias/axiom'

import { ViewVisibility } from 'models/view/types'
import type {
    TicketNavbarDragObject,
    TicketNavbarDropDirection,
} from 'pages/tickets/navbar/TicketNavbarDropTarget'
import { TicketNavbarDropTarget } from 'pages/tickets/navbar/TicketNavbarDropTarget'
import type { SectionsState } from 'state/entities/sections/types'
import type { ViewsState } from 'state/entities/views/types'
import type { RootState } from 'state/types'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'

import type { TicketNavbarSectionElement } from './TicketNavbarContent'
import { TicketNavbarView } from './TicketNavbarView'

import css from './TicketNavbarSection.less'

type OwnProps = {
    onSectionDeleteClick?: (sectionId: number) => void
    onSectionRenameClick?: (sectionId: number) => void
    sectionElement: TicketNavbarSectionElement
    sections: SectionsState
    views: ViewsState
}

export function TicketNavbarSectionBridgeContainer({
    currentUser,
    onSectionDeleteClick,
    onSectionRenameClick,
    sectionElement: { data: section, children },
    sections,
    views,
}: OwnProps & ConnectedProps<typeof connector>) {
    const emoji = section.decoration?.emoji
    const nameRef = useRef<HTMLDivElement>(null)
    const currentUserRole = currentUser.getIn(['role', 'name']) as
        | UserRole
        | undefined
    const [{ isDragging }, drag] = useDrag({
        type: TicketNavbarElementType.Section,
        item: {
            id: section.id,
            type: TicketNavbarElementType.Section,
        },
        canDrag:
            section.private ||
            hasRole({ role: { name: currentUserRole } }, UserRole.Agent),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })
    const handleDrop = useCallback(
        (
            item: TicketNavbarDragObject,
            monitor: DropTargetMonitor,
            direction: TicketNavbarDropDirection | null,
        ) => ({
            viewId: null,
            sectionId: section.id,
            direction,
        }),
        [section.id],
    )
    // NavigationSection renders children inside its own DisclosurePanel, so the
    // View DropTarget here accidentally wraps child views too. Without this guard,
    // dropping a view onto a specific child would override that child's drop result
    // (which carries the correct viewId and direction) with a section-level result
    // (viewId: null, direction: null), causing the reorder calculation to
    // prepend the item to the top of the section.
    const handleViewDrop = useCallback(
        (
            item: TicketNavbarDragObject,
            monitor: DropTargetMonitor,
            direction: TicketNavbarDropDirection | null,
        ) => {
            if (monitor.didDrop()) return
            return handleDrop(item, monitor, direction)
        },
        [handleDrop],
    )
    const canduId = addCanduLinkForValidViewOrSection('section', section)

    drag(nameRef)

    return (
        <TicketNavbarDropTarget
            accept={TicketNavbarElementType.Section}
            canDrop={(item) => sections[item.id].private === section.private}
            className={classnames({
                [css.isDragged]: isDragging,
            })}
            onDrop={handleDrop}
            shallow={false}
        >
            <TicketNavbarDropTarget
                accept={TicketNavbarElementType.View}
                bottomIndicatorClassName={css.viewIntoSectionIndicator}
                onDrop={handleViewDrop}
                canDrop={(item) =>
                    section.private
                        ? views[item.id].visibility === ViewVisibility.Private
                        : views[item.id].visibility !== ViewVisibility.Private
                }
            >
                <div ref={nameRef}>
                    <NavigationSection
                        id={`section-${section.id}`}
                        canduId={canduId}
                        label={
                            <>
                                {emoji && (
                                    <Box display="inline" pr="xxxs">
                                        {emoji}
                                    </Box>
                                )}
                                {section.name}
                            </>
                        }
                        showDisclosureIndicator={children.length > 0}
                        actionsSlot={
                            onSectionRenameClick || onSectionDeleteClick ? (
                                <TicketSectionActionsMenu
                                    triggerIcon="dots-meatballs-horizontal"
                                    actions={[
                                        ...(onSectionRenameClick
                                            ? [
                                                  {
                                                      label: 'Rename',
                                                      onClick: () =>
                                                          onSectionRenameClick(
                                                              section.id,
                                                          ),
                                                  },
                                              ]
                                            : []),
                                        ...(onSectionDeleteClick
                                            ? [
                                                  {
                                                      label: 'Delete',
                                                      onClick: () =>
                                                          onSectionDeleteClick(
                                                              section.id,
                                                          ),
                                                  },
                                              ]
                                            : []),
                                    ]}
                                />
                            ) : null
                        }
                    >
                        {children.map((view) => (
                            <TicketNavbarView
                                key={view.id}
                                view={view}
                                isNested={true}
                                sections={sections}
                                views={views}
                            />
                        ))}
                    </NavigationSection>
                </div>
            </TicketNavbarDropTarget>
        </TicketNavbarDropTarget>
    )
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
}))

const DefaultExportTicketNavbarSectionBridge = connector(
    TicketNavbarSectionBridgeContainer,
)

export { DefaultExportTicketNavbarSectionBridge }
