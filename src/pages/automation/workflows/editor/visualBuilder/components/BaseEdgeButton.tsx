import React, {forwardRef, MouseEvent, ReactNode, useCallback} from 'react'
import classnames from 'classnames'

import Tooltip from 'pages/common/components/Tooltip'
import useId from 'hooks/useId'

import css from './BaseEdgeButton.less'

export type BaseEdgeButtonProps = {
    isDisabled?: boolean
    disabledTooltip?: ReactNode
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    children: ReactNode
}

const BaseEdgeButton = forwardRef<HTMLDivElement, BaseEdgeButtonProps>(
    ({isDisabled, disabledTooltip, onClick, children}, ref) => {
        const randomId = useId()
        const id = `base-edge-button-${randomId}`

        const handleClick = useCallback(
            (event: MouseEvent<HTMLDivElement>) => {
                if (!isDisabled) {
                    onClick?.(event)
                }
            },
            [isDisabled, onClick]
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
)

export default BaseEdgeButton
