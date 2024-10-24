import classnames from 'classnames'
import _kebabCase from 'lodash/kebabCase'
import React, {ReactNode, useRef, useState} from 'react'
import {useDrag} from 'react-dnd'
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import navbarCss from 'assets/css/navbar.less'

import {ViewCategoryNavbar} from 'models/view/types'
import TicketNavbarDropTarget from 'pages/tickets/navbar/TicketNavbarDropTarget'
import {TicketNavbarElementType} from 'state/ui/ticketNavbar/types'

import css from './NavbarBlock.less'

type Props = {
    actions?: {
        label: string
        onClick: () => void
    }[]
    children: ReactNode
    className?: string
    icon?: string
    title: string
    value?: ViewCategoryNavbar
}

export default function NavbarBlock({
    actions,
    children,
    className,
    icon,
    title,
    value,
}: Props) {
    const [isOpen, setOpen] = useState(false)
    const categoryRef = useRef<HTMLHeadingElement>(null)

    const [{isDragging}, drag] = useDrag({
        item: {
            id: value,
            type: TicketNavbarElementType.Category,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    if (value !== undefined) {
        drag(categoryRef)
    }

    return (
        <TicketNavbarDropTarget
            accept={TicketNavbarElementType.Category}
            canDrop={(item) => item.type === TicketNavbarElementType.Category}
            className={classnames(css.section, {
                [css.isDragged]: isDragging,
            })}
            onDrop={(item, monitor, direction) => ({
                sectionId: null,
                viewId: null,
                categoryId: value,
                direction,
            })}
        >
            <div className={classnames(navbarCss.category, className)}>
                <h4 ref={categoryRef} className={navbarCss['category-title']}>
                    <div
                        className={css.title}
                        data-candu-id={`navbar-block-${_kebabCase(title)}`}
                    >
                        {icon && (
                            <i
                                className={classnames(
                                    'material-icons',
                                    navbarCss.icon
                                )}
                            >
                                {icon}
                            </i>
                        )}
                        {title}
                    </div>
                    {!!actions && (
                        <Dropdown
                            isOpen={isOpen}
                            toggle={() => setOpen(!isOpen)}
                        >
                            <DropdownToggle
                                className={classnames(
                                    css.toggle,
                                    'btn-transparent'
                                )}
                                color="secondary"
                                type="button"
                            >
                                <i className="material-icons">add</i>
                            </DropdownToggle>
                            <DropdownMenu right>
                                {actions.map((action) => {
                                    return (
                                        <DropdownItem
                                            className={css.action}
                                            key={action.label}
                                            onClick={action.onClick}
                                        >
                                            {action.label}
                                        </DropdownItem>
                                    )
                                })}
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </h4>
                {children}
            </div>
        </TicketNavbarDropTarget>
    )
}
