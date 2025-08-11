import { ComponentProps, ReactNode, useRef } from 'react'

import classnames from 'classnames'

import { Tooltip } from '@gorgias/axiom'

import css from './IconTooltip.less'

type TooltipProps = Omit<ComponentProps<typeof Tooltip>, 'target'>

export type IconTooltipProps = {
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
}: IconTooltipProps) => {
    const targetRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <div
                ref={targetRef}
                className={classnames(css.wrapper, className)}
                onClick={(e) => e.stopPropagation()}
            >
                <i className={classnames('material-icons-outlined', css.icon)}>
                    {icon}
                </i>
            </div>
            <Tooltip
                {...tooltipProps}
                target={targetRef}
                container={window.document.body}
            >
                {children}
            </Tooltip>
        </>
    )
}

export default IconTooltip
