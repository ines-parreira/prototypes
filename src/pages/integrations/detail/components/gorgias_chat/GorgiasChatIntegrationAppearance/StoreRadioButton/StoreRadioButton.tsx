import React, {ReactChild, MouseEvent, CSSProperties, useMemo} from 'react'
import classNames from 'classnames'
import _uniqueId from 'lodash/uniqueId'

import Tooltip from '../../../../../../common/components/Tooltip'

import css from './StoreRadioButton.less'

type Props = {
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
}: Props) => {
    const tooltipTargetId = useMemo(() => _uniqueId('store-radio-button-'), [])

    return (
        <>
            <button
                id={tooltipTargetId}
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
                target={tooltipTargetId}
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
