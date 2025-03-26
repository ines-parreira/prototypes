import React, { useCallback, useMemo, useRef, useState } from 'react'

import classnames from 'classnames'
import { useDrag } from 'react-dnd'
import { connect, ConnectedProps } from 'react-redux'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import { UserRole } from 'config/types/user'
import { ViewVisibility } from 'models/view/types'
import navbarSectionCss from 'pages/common/components/navbar/NavbarSectionBlock.less'
import { RootState } from 'state/types'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'
import { hasRole } from 'utils'
import { addCanduLinkForValidViewOrSection } from 'utils/views'

import { TicketNavbarSectionElement } from './TicketNavbarContent'
import TicketNavbarDropTarget from './TicketNavbarDropTarget'
import TicketNavbarView from './TicketNavbarView'

import css from './TicketNavbarSection.less'

type OwnProps = {
    isExpanded: boolean
    onSectionClick: (sectionId: number) => void
    onSectionDeleteClick?: (sectionId: number) => void
    onSectionRenameClick?: (sectionId: number) => void
    sectionElement: TicketNavbarSectionElement
    viewsCount: Record<string, number>
}

export function TicketNavbarSectionContainer({
    currentUser,
    isExpanded,
    onSectionClick,
    onSectionDeleteClick,
    onSectionRenameClick,
    sectionElement: { data: section, children },
    sections,
    views,
    viewsCount,
}: OwnProps & ConnectedProps<typeof connector>) {
    const emoji = section.decoration?.emoji
    const [isOpen, setOpen] = useState(false)
    const nameRef = useRef<HTMLDivElement>(null)
    const ticketNavbarSectionId = useMemo(
        () => `ticket-navbar-section-${section.id}`,
        [section],
    )
    const [{ isDragging }, drag] = useDrag({
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
        (item, monitor, direction) => ({
            viewId: null,
            sectionId: section.id,
            direction,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )
    const canduId = addCanduLinkForValidViewOrSection('section', section)
    const handleClick = () => onSectionClick(section.id)

    drag(nameRef)
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
            <TicketNavbarDropTarget
                accept={TicketNavbarElementType.View}
                canDrop={(item) => {
                    return section.private
                        ? views[item.id].visibility === ViewVisibility.Private
                        : views[item.id].visibility !== ViewVisibility.Private
                }}
                onDrop={handleDrop}
                bottomIndicatorClassName={css.viewIntoSectionIndicator}
            >
                <div
                    className={navbarSectionCss.nameWrapper}
                    id={ticketNavbarSectionId}
                    ref={nameRef}
                >
                    <div className={css.nameWrapper}>
                        <div
                            className={
                                navbarSectionCss.toggleSectionIconWrapper
                            }
                        >
                            <i
                                onClick={handleClick}
                                className={classnames(
                                    navbarSectionCss.toggleSectionIcon,
                                    'material-icons',
                                )}
                            >
                                {isExpanded ? 'arrow_drop_down' : 'arrow_right'}
                            </i>
                        </div>
                        <div
                            {...(canduId ? { 'data-candu-id': canduId } : {})}
                            onClick={handleClick}
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
                    </div>
                    {(onSectionDeleteClick || onSectionRenameClick) && (
                        <Dropdown
                            isOpen={isOpen}
                            toggle={() => setOpen(!isOpen)}
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
            {isExpanded &&
                children.map((view) => (
                    <TicketNavbarView
                        key={view.id}
                        view={view}
                        viewCount={viewsCount[view.id]}
                    />
                ))}
        </TicketNavbarDropTarget>
    )
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
    sections: state.entities.sections,
    views: state.entities.views,
}))

export default connector(TicketNavbarSectionContainer)
