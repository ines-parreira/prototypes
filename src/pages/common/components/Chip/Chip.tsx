import React, {MouseEvent} from 'react'
import classNames from 'classnames'

import checkIcon from 'assets/img/icons/check-icon.svg'

import css from './Chip.less'

type Props = {
    id: string
    isActive?: boolean
    isDisabled?: boolean
    label: string
    onClick: (event: MouseEvent, id: string) => void
}

export const Chip = ({
    id,
    isActive = false,
    isDisabled = false,
    label,
    onClick,
}: Props) => {
    return (
        <button
            className={classNames(css.container, {
                [css.active]: isActive,
                [css.disabled]: isDisabled,
            })}
            aria-pressed={isActive}
            onClick={(event) => onClick(event, id)}
        >
            {isActive && (
                <img
                    className={css.icon}
                    src={checkIcon}
                    alt="checked chip icon"
                />
            )}
            <span>{label}</span>
        </button>
    )
}
