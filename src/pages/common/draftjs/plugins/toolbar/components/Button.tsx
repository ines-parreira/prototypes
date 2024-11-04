import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React, {ForwardedRef, forwardRef, MouseEvent} from 'react'

import useId from 'hooks/useId'
import IconButton from 'pages/common/components/button/IconButton'

import css from './Button.less'

type Props = {
    name: string
    isActive: boolean
    isDisabled: boolean
    icon: string
    onToggle: () => void
}

const Button = (props: Props, ref: ForwardedRef<HTMLButtonElement>) => {
    const randomId = useId()
    const id = `toolbar-button-${randomId}`

    return (
        <>
            <IconButton
                ref={ref}
                className={classnames(css.button, {
                    [css.isActive]: props.isActive,
                })}
                intent="secondary"
                onClick={(e: MouseEvent) => {
                    e.preventDefault()
                    if (!props.isDisabled) {
                        props.onToggle()
                    }
                }}
                onMouseDown={(e: MouseEvent) => e.preventDefault()}
                size="small"
                id={id}
            >
                {props.icon}
            </IconButton>
            <Tooltip
                autohide={false}
                delay={100}
                target={id}
                placement="bottom"
            >
                {props.name}
            </Tooltip>
        </>
    )
}

export default forwardRef<HTMLButtonElement, Props>(Button)
