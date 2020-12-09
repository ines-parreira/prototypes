import classnames from 'classnames'
import React, {ReactNode, useState} from 'react'
import {Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import css from './NavbarBlock.less'

type Props = {
    actions?: {
        label: string
        onClick: () => void
    }[]
    children: ReactNode
    title: string
}

export default function NavbarBlock({actions, children, title}: Props) {
    const [isOpen, setOpen] = useState(false)

    return (
        <div>
            <div className="item">
                <h4 className={css.header}>
                    <div className={css.title}>{title}</div>
                    {actions && actions.length > 0 && (
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
        </div>
    )
}
