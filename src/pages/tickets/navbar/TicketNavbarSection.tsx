import classnames from 'classnames'
import React, {useState, useRef, useCallback, useMemo} from 'react'
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {useDrag} from 'react-dnd'

import {hasRole} from '../../../utils'
import {RootState} from '../../../state/types'
import {UserRole} from '../../../config/types/user'
import {ViewVisibility} from '../../../models/view/types'

import {TicketNavbarSectionElement} from './TicketNavbarContent'
import css from './TicketNavbarSection.less'
import TicketNavbarView from './TicketNavbarView'
import {TicketNavbarElementType} from './TicketNavbar'
import TicketNavbarDropTarget from './TicketNavbarDropTarget'

type OwnProps = {
    isExpanded: boolean
    onSectionClick: (sectionId: number) => void
    onSectionDeleteClick?: (sectionId: number) => void
    onSectionRenameClick?: (sectionId: number) => void
    sectionElement: TicketNavbarSectionElement
}

export function TicketNavbarSectionContainer({
    currentUser,
    isExpanded,
    onSectionClick,
    onSectionDeleteClick,
    onSectionRenameClick,
    sectionElement: {data: section, children},
    sections,
    views,
}: OwnProps & ConnectedProps<typeof connector>) {
    const emoji = section.decoration?.emoji
    const [isOpen, setOpen] = useState(false)
    const nameRef = useRef<HTMLDivElement>(null)
    const ticketNavbarSectionId = useMemo(
        () => `ticket-navbar-section-${section.id}`,
        [section]
    )
    const [{isDragging}, drag] = useDrag({
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
        []
    )
    const handleClick = () => onSectionClick(section.id)

    drag(nameRef)
    return (
        <TicketNavbarDropTarget
            accept={TicketNavbarElementType.Section}
            canDrop={(item) => {
                return sections[item.id].private === section.private
            }}
            className={classnames(css.section, {[css.isDragged]: isDragging})}
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
                    className={classnames(
                        css.nameWrapper,
                        'd-flex align-items-center flex-grow'
                    )}
                    id={ticketNavbarSectionId}
                    ref={nameRef}
                >
                    <div className={css.toggleSectionIconWrapper}>
                        <i
                            onClick={handleClick}
                            className={classnames(
                                css.toggleSectionIcon,
                                'material-icons'
                            )}
                        >
                            {isExpanded ? 'arrow_drop_down' : 'arrow_right'}
                        </i>
                    </div>
                    <div
                        onClick={handleClick}
                        className={classnames(css.name, 'flex-grow')}
                        title={section.name}
                    >
                        {!!emoji && <span className={css.emoji}>{emoji}</span>}
                        {section.name}
                    </div>
                    {(onSectionDeleteClick || onSectionRenameClick) && (
                        <Dropdown
                            isOpen={isOpen}
                            toggle={() => setOpen(!isOpen)}
                        >
                            <DropdownToggle
                                className={classnames(
                                    css.editSectionIcon,
                                    'btn-transparent'
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
                                            css.red
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
                    <TicketNavbarView key={view.id} view={view} />
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
