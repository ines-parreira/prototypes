import type { ReactNode } from 'react'
import React, { useRef, useState } from 'react'

import classnames from 'classnames'
import _kebabCase from 'lodash/kebabCase'
import { useDrag } from 'react-dnd'
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import navbarCss from 'assets/css/navbar.less'
import type { ViewCategoryNavbar } from 'models/view/types'
import css from 'pages/common/components/navbar/NavbarBlock.less'
import IconInput from 'pages/common/forms/input/IconInput'
import TicketNavbarDropTarget from 'pages/tickets/navbar/TicketNavbarDropTarget'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'

type Props = {
    actions?: {
        label: string
        onClick: () => void
    }[]
    children: ReactNode
    iconClassName?: string
    icon?: string
    title: string
    className?: string
    value?: ViewCategoryNavbar
    dropdownClassName?: string
    actionsIcon?: {
        name: string
        isOutlined?: boolean
        isDisabled?: boolean
        tooltip?: string
        className?: string
        callback?: () => void
    }
}

const actionsIconId = 'actions-icon'

export default function NavbarBlock({
    actions,
    children,
    className,
    icon,
    title,
    value,
    dropdownClassName,
    actionsIcon = {
        name: 'add',
        isOutlined: false,
        isDisabled: false,
        tooltip: undefined,
        className: '',
    },
}: Props) {
    const [isOpen, setOpen] = useState(false)
    const categoryRef = useRef<HTMLHeadingElement>(null)

    const [{ isDragging }, drag] = useDrag({
        type: TicketNavbarElementType.Category,
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

    const handleActionsIconClick = () => {
        setOpen(!isOpen)
        actionsIcon.callback?.()
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
                                    navbarCss.icon,
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
                            disabled={actionsIcon.isDisabled}
                            toggle={handleActionsIconClick}
                        >
                            <DropdownToggle
                                className={classnames(
                                    css.toggle,
                                    'btn-transparent',
                                )}
                                color="secondary"
                                type="button"
                            >
                                <IconInput
                                    id={actionsIconId}
                                    icon={actionsIcon.name}
                                    isOutlined={actionsIcon.isOutlined}
                                    className={actionsIcon.className}
                                />
                                {actionsIcon.tooltip && (
                                    <Tooltip
                                        target={actionsIconId}
                                        placement="bottom-end"
                                    >
                                        {actionsIcon.tooltip}
                                    </Tooltip>
                                )}
                            </DropdownToggle>
                            <DropdownMenu right>
                                {actions.map((action) => {
                                    return (
                                        <DropdownItem
                                            className={classnames(
                                                css.action,
                                                dropdownClassName,
                                            )}
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
