import React from 'react'
import classNames from 'classnames'

import Button, {ButtonProps} from 'reactstrap/lib/Button'

import Tooltip from '../../../../../../../common/components/Tooltip'

import css from './ActionButton.less'

export type ActionButtonVariant = 'danger' | 'neutral'

export type ActionButtonProps = ButtonProps & {
    help?: React.ReactNode
    variant?: ActionButtonVariant
}

export const ActionButton = ({
    help,
    variant,
    children,
    ...rest
}: ActionButtonProps): JSX.Element => {
    const $tooltipRef = React.createRef<HTMLButtonElement>()
    return (
        <>
            <Button
                {...rest}
                className={classNames(rest.className, {
                    [css.base]: true,
                    [css.danger]: variant === 'danger',
                    [css.neutral]: variant === 'neutral',
                })}
                color="link"
                innerRef={$tooltipRef}
            >
                {children}
            </Button>
            {help && (
                <Tooltip target={$tooltipRef} placement="top-start">
                    {help}
                </Tooltip>
            )}
        </>
    )
}
