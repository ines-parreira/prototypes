import React, {
    ForwardedRef,
    forwardRef,
    MouseEvent,
    ReactNode,
    useCallback,
} from 'react'

import { useId } from '@repo/hooks'
import classnames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import css from './BaseEdgeButton.less'

export type BaseEdgeButtonProps = {
    isDisabled?: boolean
    disabledTooltip?: ReactNode
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    children: ReactNode
}

const BaseEdgeButton = (
    { isDisabled, disabledTooltip, onClick, children }: BaseEdgeButtonProps,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    const randomId = useId()
    const id = `base-edge-button-${randomId}`

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (!isDisabled) {
                onClick?.(event)
            }
        },
        [isDisabled, onClick],
    )

    return (
        <>
            <div
                id={id}
                ref={ref}
                className={classnames(css.container, {
                    [css.isDisabled]: isDisabled,
                })}
                onClick={handleClick}
            >
                {children}
            </div>
            {disabledTooltip && (
                <Tooltip
                    placement="top-start"
                    target={id}
                    disabled={!isDisabled}
                >
                    {disabledTooltip}
                </Tooltip>
            )}
        </>
    )
}

export default forwardRef<HTMLDivElement, BaseEdgeButtonProps>(BaseEdgeButton)
