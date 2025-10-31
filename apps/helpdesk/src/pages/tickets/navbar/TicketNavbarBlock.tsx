import { ReactNode, useRef, useState } from 'react'

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

import { Navigation } from 'components/Navigation/Navigation'
import { ViewCategoryNavbar } from 'models/view/types'
import IconInput from 'pages/common/forms/input/IconInput'
import TicketNavbarDropTarget from 'pages/tickets/navbar/TicketNavbarDropTarget'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'

import { TicketNavbarElement } from './TicketNavbarContent'

import css from './TicketNavbarBlock.less'

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
    elements: TicketNavbarElement[]
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

export function TicketNavbarBlock({
    actions,
    children,
    icon,
    title,
    value,
    elements,
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
    const categoryRef = useRef<HTMLDivElement>(null)

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
            onDrop={(__, ___, direction) => ({
                sectionId: null,
                viewId: null,
                categoryId: value,
                direction,
            })}
        >
            <Navigation.Section value={title}>
                <div
                    className={css.navbarBlockTriggerContainer}
                    ref={categoryRef}
                >
                    <Navigation.SectionTrigger>
                        <div
                            className={css.title}
                            data-candu-id={`navbar-block-${_kebabCase(title)}`}
                        >
                            {icon && (
                                <i className={classnames('material-icons')}>
                                    {icon}
                                </i>
                            )}
                            {title}
                        </div>

                        {elements?.length > 0 && (
                            <Navigation.SectionIndicator />
                        )}
                    </Navigation.SectionTrigger>
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
                                    css.actionToggle,
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
                                {actions.map((action) => (
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
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </div>
                {elements?.length > 0 && (
                    <Navigation.SectionContent>
                        {children}
                    </Navigation.SectionContent>
                )}
            </Navigation.Section>
        </TicketNavbarDropTarget>
    )
}
