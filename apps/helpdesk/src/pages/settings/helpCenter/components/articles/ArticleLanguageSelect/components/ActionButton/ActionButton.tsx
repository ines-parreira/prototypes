import { useId } from '@repo/hooks'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import Button, { type ButtonProps } from 'pages/common/components/button/Button'

export type ActionButtonVariant = 'danger' | 'neutral'

export type ActionButtonProps = Omit<ButtonProps, 'type' | 'intent' | 'id'> & {
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
