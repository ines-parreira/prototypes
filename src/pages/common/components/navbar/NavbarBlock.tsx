import React, {ReactNode, useState} from 'react'
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'
import classnames from 'classnames'

import navbarCss from '../../../../../css/navbar.less'

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
}

export default function NavbarBlock({
    actions,
    children,
    className,
    icon,
    title,
}: Props) {
    const [isOpen, setOpen] = useState(false)

    return (
        <div className={classnames(navbarCss.category, className)}>
            <h4 className={navbarCss['category-title']}>
                <div className={css.title}>
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
                {actions && actions.length > 0 && (
                    <Dropdown isOpen={isOpen} toggle={() => setOpen(!isOpen)}>
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
    )
}
