import React, {ComponentProps, ReactNode, Ref, forwardRef} from 'react'
import classnames from 'classnames'

import Tooltip from 'pages/common/components/Tooltip'
import useId from 'hooks/useId'

import IconButton from '../../button/IconButton'
import css from './IconButtonTooltip.less'

type TooltipProps = ComponentProps<typeof Tooltip>

type Props = ComponentProps<typeof IconButton> & {
    children: ReactNode
    icon?: string
    tooltipProps?: Partial<TooltipProps>
    interactive?: boolean
}

const IconButtonTooltip = (
    {children, className, icon = 'info', id, tooltipProps, ...rest}: Props,
    ref?: Ref<HTMLButtonElement> | null
) => {
    const generatedId = useId()
    const buttonId = id ?? `icon-button-${generatedId}`

    return (
        <div className={classnames(css.wrapper, className)}>
            <IconButton id={buttonId} ref={ref} {...rest}>
                {icon}
            </IconButton>
            <Tooltip target={buttonId} {...tooltipProps}>
                {children}
            </Tooltip>
        </div>
    )
}

export default forwardRef<HTMLButtonElement, Props>(IconButtonTooltip)
