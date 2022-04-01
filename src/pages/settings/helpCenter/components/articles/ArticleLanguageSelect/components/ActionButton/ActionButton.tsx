import React, {useRef} from 'react'
import _uniqueId from 'lodash/uniqueId'

import Button from 'pages/common/components/button/Button'

import Tooltip from '../../../../../../../common/components/Tooltip'

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
    const id = useRef(_uniqueId('action-button-'))
    return (
        <>
            <Button
                {...rest}
                id={id.current}
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
                <Tooltip target={id.current} placement="top-start">
                    {help}
                </Tooltip>
            )}
        </>
    )
}
