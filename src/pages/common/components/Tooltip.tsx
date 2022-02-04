import classnames from 'classnames'
import React, {ReactNode, useMemo} from 'react'
import {UncontrolledTooltip, UncontrolledTooltipProps} from 'reactstrap'

import {isTouchDevice} from '../utils/mobile'

import css from './Tooltip.less'

type Trigger = 'click' | 'hover' | 'legacy' | 'manual' | 'focus'

type Props = {
    children: ReactNode
    delay?: number | {show: number; hide: number}
    disabled?: boolean
    offset?: string | number
    boundariesElement?: string | Element
    arrowClassName?: string
    trigger?: Trigger[]
} & Pick<UncontrolledTooltipProps, KnownKeys<UncontrolledTooltipProps>>

export default function Tooltip({
    children,
    className,
    delay,
    autohide,
    disabled = false,
    trigger,
    ...rest
}: Props) {
    const tooltipDelay = useMemo(() => {
        if (delay) {
            return delay
        } else if (isTouchDevice()) {
            // delay default fix tap-twice on buttons with tooltips bug, on iOS
            return 200
        } else if (autohide === false) {
            return {show: 0, hide: 200}
        }
        return 0
    }, [autohide, delay])

    if (disabled) {
        return null
    }

    return (
        <UncontrolledTooltip
            className={classnames(css.tooltip, className)}
            {...rest}
            autohide={autohide}
            delay={tooltipDelay}
            trigger={trigger ? trigger.join(' ') : trigger}
        >
            {children}
        </UncontrolledTooltip>
    )
}
