import { useCallback, useMemo, useRef, useState } from 'react'

import classnames from 'classnames'
import { useDrag } from 'react-dnd'
import { connect, ConnectedProps } from 'react-redux'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import { Navigation } from 'components/Navigation/Navigation'
import { UserRole } from 'config/types/user'
import { ViewVisibility } from 'models/view/types'
import navbarSectionCss from 'pages/common/components/navbar/NavbarSectionBlock.less'
import { RootState } from 'state/types'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'
import { hasRole } from 'utils'
import { addCanduLinkForValidViewOrSection } from 'utils/views'

import { TicketNavbarSectionElement } from '../TicketNavbarContent'
import TicketNavbarDropTarget from '../TicketNavbarDropTarget'
import { TicketNavbarViewV2 } from './TicketNavbarViewV2'

import css from './TicketNavbarSectionV2.less'

type OwnProps = {
    onSectionDeleteClick?: (sectionId: number) => void
    onSectionRenameClick?: (sectionId: number) => void
    sectionElement: TicketNavbarSectionElement
    viewsCount: Record<string, number>
}

export function TicketNavbarSectionContainerV2({
    currentUser,
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
        [section.id],
    )
    const canduId = addCanduLinkForValidViewOrSection('section', section)

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
                bottomIndicatorClassName={css.viewIntoSectionIndicator}
                onDrop={handleDrop}
                canDrop={(item) =>
                    section.private
                        ? views[item.id].visibility === ViewVisibility.Private
                        : views[item.id].visibility !== ViewVisibility.Private
                }
            >
                <Navigation.Section value={section.id}>
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

                            <Navigation.SectionIndicator />
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
                    <Navigation.SectionContent>
                        {children.map((view) => (
                            <TicketNavbarViewV2
                                key={view.id}
                                view={view}
                                viewCount={viewsCount[view.id]}
                            />
                        ))}
                    </Navigation.SectionContent>
                </Navigation.Section>
            </TicketNavbarDropTarget>
        </TicketNavbarDropTarget>
    )
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
    sections: state.entities.sections,
    views: state.entities.views,
}))

export default connector(TicketNavbarSectionContainerV2)
