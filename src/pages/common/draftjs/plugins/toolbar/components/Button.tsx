import React, {MouseEvent} from 'react'
import classnames from 'classnames'

import IconButton from 'pages/common/components/button/IconButton'
import Tooltip from 'pages/common/components/Tooltip'

import css from './Button.less'

type Props = {
    name: string
    isActive: boolean
    isDisabled: boolean
    icon: string
    onToggle: () => void
    id: string
}

const Button = (props: Props) => (
    <>
        <IconButton
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
            id={props.id}
        >
            {props.icon}
        </IconButton>
        <Tooltip
            autohide={false}
            delay={100}
            target={props.id}
            placement="bottom"
        >
            {props.name}
        </Tooltip>
    </>
)

export default Button
