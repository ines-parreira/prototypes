import React, {createRef, ReactChild, MouseEvent, CSSProperties} from 'react'
import classNames from 'classnames'

import Tooltip from '../Tooltip'

import css from './StoreRadioButton.less'

export type StoreRadioButtonProps = {
    className?: string
    icon: ReactChild
    isSelected?: boolean
    label: string
    tooltipText: string
    style?: CSSProperties
    onClick: (ev: MouseEvent<HTMLButtonElement>) => void
}

export const StoreRadioButton = ({
    className,
    icon,
    isSelected = false,
    label,
    tooltipText,
    style,
    onClick,
}: StoreRadioButtonProps): JSX.Element => {
    const ref = createRef<HTMLButtonElement>()
    return (
        <>
            <button
                ref={ref}
                className={classNames(
                    {
                        [css.container]: true,
                        [css.selected]: isSelected,
                    },
                    className
                )}
                style={style}
                onClick={onClick}
            >
                <div className={css.iconContainer}>{icon}</div>
                <span className={css.label}>{label}</span>
            </button>
            <Tooltip
                autohide
                delay={{show: 200, hide: 0}}
                placement="bottom"
                target={ref}
                style={{
                    textAlign: 'center',
                    width: 180,
                }}
            >
                {tooltipText}
            </Tooltip>
        </>
    )
}
