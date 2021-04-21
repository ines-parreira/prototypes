import React from 'react'
import classnames from 'classnames'

import css from './DropdownOptionButton.less'

type Props = {
    className?: string
    disabled?: boolean
    icon: string
    onClick?: () => void
}

export const DropdownOptionButton = ({
    className,
    icon,
    disabled = false,
    onClick = () => null,
}: Props) => {
    return (
        <span
            className={classnames(css.dropdownButton, {disabled})}
            onClick={onClick}
        >
            <i className={classnames(className, css.icon, 'material-icons')}>
                {icon}
            </i>
        </span>
    )
}
