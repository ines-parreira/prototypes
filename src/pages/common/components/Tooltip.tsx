import classnames from 'classnames'
import React, {ReactNode} from 'react'
import {UncontrolledTooltip, UncontrolledTooltipProps} from 'reactstrap'

import {isTouchDevice} from '../utils/mobile.js'

import css from './Tooltip.less'

type Props = {
    children: ReactNode
    delay?: number | {show: number; hide: number}
    disabled?: boolean
    offset?: string | number
    boundariesElement?: string | Element
} & Pick<UncontrolledTooltipProps, KnownKeys<UncontrolledTooltipProps>>

export default function Tooltip({
    children,
    className,
    // delay default fix tap-twice on buttons with tooltips bug, on iOS
    delay = isTouchDevice() ? 200 : 0,
    disabled = false,
    ...rest
}: Props) {
    if (disabled) {
        return null
    }

    return (
        <UncontrolledTooltip
            className={classnames(css.tooltip, className)}
            {...rest}
            delay={delay}
        >
            {children}
        </UncontrolledTooltip>
    )
}
