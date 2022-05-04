import React from 'react'

import Button from 'pages/common/components/button/Button'
import Tooltip from 'pages/common/components/Tooltip'
import useId from 'hooks/useId'

export type ActionButtonVariant = 'danger' | 'neutral'

export type ActionButtonProps = Omit<
    React.ComponentProps<typeof Button>,
    'type' | 'intent' | 'id'
> & {
    help?: React.ReactNode
    variant?: ActionButtonVariant
}

export const ActionButton = ({
    help,
    variant,
    children,
    ...rest
}: ActionButtonProps): JSX.Element => {
    const id = useId()
    const tooltipId = 'action-button-' + id
    return (
        <>
            <Button
                {...rest}
                id={tooltipId}
                fillStyle="ghost"
                intent={
                    variant === 'danger'
                        ? 'destructive'
                        : variant === 'neutral'
                        ? 'secondary'
                        : 'primary'
                }
            >
                {children}
            </Button>
            {help && (
                <Tooltip target={tooltipId} placement="top-start">
                    {help}
                </Tooltip>
            )}
        </>
    )
}
