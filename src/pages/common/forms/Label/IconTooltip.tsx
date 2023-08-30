import React, {ComponentProps, ReactNode, useContext} from 'react'
import classnames from 'classnames'

import Tooltip from 'pages/common/components/Tooltip'
import {InputFieldContext} from 'pages/common/forms/input/InputField'
import useId from 'hooks/useId'

import css from './IconTooltip.less'

type TooltipProps = ComponentProps<typeof Tooltip>

type Props = {
    children: ReactNode
    className?: string
    icon?: string
    tooltipProps?: Partial<TooltipProps>
    interactive?: boolean
}

const IconTooltip = ({
    children,
    className,
    icon = 'info',
    tooltipProps,
}: Props) => {
    const {id: contextId} = useContext(InputFieldContext)
    const id = useId()
    const tooltipId = (contextId && `${contextId}-tooltip`) || 'tooltip-' + id

    return (
        <div className={classnames(css.wrapper, className)}>
            <i
                id={tooltipId}
                className={classnames('material-icons-outlined', css.icon)}
            >
                {icon}
            </i>
            <Tooltip
                target={tooltipId}
                style={{textAlign: 'left'}}
                {...tooltipProps}
            >
                {children}
            </Tooltip>
        </div>
    )
}

export default IconTooltip
