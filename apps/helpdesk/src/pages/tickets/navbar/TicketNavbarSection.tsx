import { useCallback, useMemo, useRef, useState } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { NavigationSection } from '@repo/navigation'
import { TicketSectionActionsMenu } from '@repo/tickets'
import { addCanduLinkForValidViewOrSection } from '@repo/tickets/utils/views'
import classnames from 'classnames'
import type { DropTargetMonitor } from 'react-dnd'
import { useDrag } from 'react-dnd'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import { Box } from '@gorgias/axiom'

import { Navigation } from 'components/Navigation/Navigation'
import { UserRole } from 'config/types/user'
import { ViewVisibility } from 'models/view/types'
import navbarSectionCss from 'pages/common/components/navbar/NavbarSectionBlock.less'
import type {
    TicketNavbarDragObject,
    TicketNavbarDropDirection,
} from 'pages/tickets/navbar/TicketNavbarDropTarget'
import { TicketNavbarDropTarget } from 'pages/tickets/navbar/TicketNavbarDropTarget'
import type { RootState } from 'state/types'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'
import { hasRole } from 'utils'

import type { TicketNavbarSectionElement } from './TicketNavbarContent'
import { TicketNavbarView } from './TicketNavbarView'

import css from './TicketNavbarSection.less'

type OwnProps = {
    onSectionDeleteClick?: (sectionId: number) => void
    onSectionRenameClick?: (sectionId: number) => void
    sectionElement: TicketNavbarSectionElement
}

// Redux-backed legacy path used when the ticket nav SDK source flag is disabled.
export function TicketNavbarSectionContainer({
    currentUser,
    onSectionDeleteClick,
    onSectionRenameClick,
    sectionElement: { data: section, children },
    sections,
    views,
}: OwnProps & ConnectedProps<typeof connector>) {
    const emoji = section.decoration?.emoji
    const [isOpen, setOpen] = useState(false)
    const nameRef = useRef<HTMLDivElement>(null)
    const ticketNavbarSectionId = useMemo(
        () => `ticket-navbar-section-${section.id}`,
        [section],
    )
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const [{ isDragging }, drag] = useDrag({
        type: TicketNavbarElementType.Section,
        item: {
            id: section.id,
            type: TicketNavbarElementType.Section,
        },
        canDrag: section.private || hasRole(currentUser, UserRole.Agent),
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
    // (viewId: null, direction: null), causing getNextSettings to always prepend
    // the item to the top of the section.
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

    if (hasWayfindingMS1Flag) {
        return (
            <TicketNavbarDropTarget
                accept={TicketNavbarElementType.Section}
                canDrop={(item) =>
                    sections[item.id].private === section.private
                }
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
                            ? views[item.id].visibility ===
                              ViewVisibility.Private
                            : views[item.id].visibility !==
                              ViewVisibility.Private
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
                                />
                            ))}
                        </NavigationSection>
                    </div>
                </TicketNavbarDropTarget>
            </TicketNavbarDropTarget>
        )
    }

    return (
        <TicketNavbarDropTarget
            accept={TicketNavbarElementType.Section}
            canDrop={(item) => sections[item.id].private === section.private}
            className={classnames(navbarSectionCss.section, css.section, {
                [css.isDragged]: isDragging,
            })}
            onDrop={handleDrop}
            shallow={false}
        >
            <Navigation.Section value={section.id}>
                <TicketNavbarDropTarget
                    accept={TicketNavbarElementType.View}
                    bottomIndicatorClassName={css.viewIntoSectionIndicator}
                    onDrop={handleDrop}
                    canDrop={(item) =>
                        section.private
                            ? views[item.id].visibility ===
                              ViewVisibility.Private
                            : views[item.id].visibility !==
                              ViewVisibility.Private
                    }
                >
                    <div
                        ref={nameRef}
                        className={css.navbarSectionTriggerContainer}
                    >
                        <Navigation.SectionTrigger id={ticketNavbarSectionId}>
                            <div
                                {...(canduId
                                    ? { 'data-candu-id': canduId }
                                    : {})}
                                className={classnames(
                                    navbarSectionCss.name,
                                    css.name,
                                )}
                                title={section.name}
                            >
                                {!!emoji && (
                                    <span className={css.emoji}>{emoji}</span>
                                )}
                                {section.name}
                            </div>
                            {children?.length > 0 && (
                                <Navigation.SectionIndicator />
                            )}
                        </Navigation.SectionTrigger>
                        {(onSectionDeleteClick || onSectionRenameClick) && (
                            <Dropdown
                                isOpen={isOpen}
                                toggle={() => setOpen(!isOpen)}
                                className={css.navbarSectiondropdown}
                            >
                                <DropdownToggle
                                    className={classnames(
                                        css.editSectionIcon,
                                        'btn-transparent',
                                    )}
                                    color="secondary"
                                    type="button"
                                >
                                    <i className="material-icons">...</i>
                                </DropdownToggle>
                                <DropdownMenu className={css.menu} right>
                                    {onSectionRenameClick && (
                                        <DropdownItem
                                            className={css.action}
                                            onClick={() =>
                                                onSectionRenameClick(section.id)
                                            }
                                        >
                                            Rename
                                        </DropdownItem>
                                    )}
                                    {onSectionDeleteClick && (
                                        <DropdownItem
                                            className={classnames(
                                                css.action,
                                                css.red,
                                            )}
                                            onClick={() =>
                                                onSectionDeleteClick(section.id)
                                            }
                                        >
                                            Delete
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                </TicketNavbarDropTarget>
                <Navigation.SectionContent
                    className={css.navBarSectionContentContainer}
                >
                    {children.map((view) => (
                        <TicketNavbarView
                            key={view.id}
                            view={view}
                            isNested={true}
                        />
                    ))}
                </Navigation.SectionContent>
            </Navigation.Section>
        </TicketNavbarDropTarget>
    )
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
    sections: state.entities.sections,
    views: state.entities.views,
}))

const DefaultExportTicketNavbarSection = connector(TicketNavbarSectionContainer)

export { DefaultExportTicketNavbarSection }
