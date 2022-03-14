import React, {MouseEvent} from 'react'
import classnames from 'classnames'

import IconButton from 'pages/common/components/button/IconButton'

import css from './Button.less'

type Props = {
    name: string
    isActive: boolean
    isDisabled: boolean
    icon: string
    onToggle: () => void
}

const Button = (props: Props) => (
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
        title={props.name}
    >
        {props.icon}
    </IconButton>
)

export default Button
