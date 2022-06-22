import React from 'react'
import classnames from 'classnames'

import css from './DropdownOptionButton.less'

type Props = {
    className?: string
    id?: string
    disabled?: boolean
    icon: string
    onClick?: () => void
}

export const DropdownOptionButton = ({
    className,
    icon,
    id,
    disabled = false,
    onClick = () => null,
}: Props) => (
    <span
        className={classnames(css.dropdownButton, {disabled})}
        id={id}
        onClick={onClick}
    >
        <i className={classnames(className, css.icon, 'material-icons')}>
            {icon}
        </i>
    </span>
)
