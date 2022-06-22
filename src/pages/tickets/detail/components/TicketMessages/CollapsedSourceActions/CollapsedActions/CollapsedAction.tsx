import React from 'react'

import {DropdownItem} from 'reactstrap'

import classnames from 'classnames'

import _noop from 'lodash/noop'

import css from './CollapsedAction.less'

type Props = {
    icon: React.ReactNode
    id?: string
    title: string
    description: string
    className?: string
    nested?: boolean
    disabled?: boolean
    toggle?: boolean
    onClick?: React.MouseEventHandler
}

const CollapsedAction: React.FC<Props> = ({
    icon,
    id,
    title,
    description,
    className,
    nested,
    disabled,
    toggle,
    onClick = _noop,
}) => (
    <DropdownItem
        id={id}
        className={classnames(css.dropdownItem, className, {
            [css.disabled]: disabled,
        })}
        onClick={disabled ? undefined : onClick}
        toggle={toggle === undefined ? (disabled ? false : undefined) : toggle}
    >
        <div className={css.icon}>{icon}</div>
        <div className={css.content}>
            <div className={css.title}>{title}</div>
            <div className={css.description}>{description}</div>
        </div>
        {nested && (
            <div className={css.forwardIcon}>
                <i className="material-icons">arrow_forward_ios</i>
            </div>
        )}
    </DropdownItem>
)

export default CollapsedAction
