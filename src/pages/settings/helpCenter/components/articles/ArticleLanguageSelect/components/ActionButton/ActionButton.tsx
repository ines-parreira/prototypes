import React, {useRef} from 'react'
import classNames from 'classnames'
import _uniqueId from 'lodash/uniqueId'

import Button from 'pages/common/components/button/Button'

import Tooltip from '../../../../../../../common/components/Tooltip'

import css from './ActionButton.less'

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
                className={classNames(rest.className, {
                    [css.base]: true,
                    [css.danger]: variant === 'danger',
                    [css.neutral]: variant === 'neutral',
                })}
                intent="text"
                id={id.current}
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
