import type { ForwardedRef, MouseEvent } from 'react'
import React, { forwardRef } from 'react'
import { Duration } from '@gorgias/toolkit'

import classnames from 'classnames'
import { useId } from '@gorgias/toolkit-react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { IconButton } from 'pages/common/components/button/IconButton'

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
                    [css.isDisabled]: props.isDisabled,
                })}
                intent="secondary"
                onClick={(e: MouseEvent) => {
                    e.preventDefault()
                    props.onToggle()
                }}
                onMouseDown={(e: MouseEvent) => e.preventDefault()}
                size="small"
                id={id}
            >
                {props.icon}
            </IconButton>

            <Tooltip
                autohide={false}
                delay={Duration.millis(100)}
                target={id}
                placement="bottom"
            >
                {props.name}
            </Tooltip>
        </>
    )
}

const DefaultExportButton = forwardRef<HTMLButtonElement, Props>(Button)

export { DefaultExportButton }
