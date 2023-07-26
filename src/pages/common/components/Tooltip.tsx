import classnames from 'classnames'
import React, {ReactNode, useContext, useMemo} from 'react'
import {
    Tooltip as ControlledTooltip,
    UncontrolledTooltip,
    TooltipProps,
} from 'reactstrap'

import {AppUIContext} from 'providers/ui/AppUIContext'
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
} & RemoveIndex<TooltipProps>

export default function Tooltip({
    children,
    className,
    container,
    delay,
    autohide = true,
    disabled = false,
    trigger,
    isOpen,
    ...rest
}: Props) {
    const appUIContext = useContext(AppUIContext)
    const containerNode = useMemo(
        () => container ?? appUIContext.appRef?.current,
        [appUIContext, container]
    )

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

    return typeof isOpen === 'undefined' ? (
        <UncontrolledTooltip
            className={classnames(css.tooltip, className, {
                [css.noPointerEvents]: autohide,
            })}
            container={containerNode ?? undefined}
            {...rest}
            autohide={autohide}
            delay={tooltipDelay}
            trigger={trigger ? trigger.join(' ') : trigger}
        >
            {children}
        </UncontrolledTooltip>
    ) : (
        <ControlledTooltip
            className={classnames(css.tooltip, className, {
                [css.noPointerEvents]: autohide,
            })}
            container={containerNode ?? undefined}
            {...rest}
            autohide={autohide}
            delay={tooltipDelay}
            trigger={trigger ? trigger.join(' ') : trigger}
            isOpen={isOpen}
        >
            {children}
        </ControlledTooltip>
    )
}
