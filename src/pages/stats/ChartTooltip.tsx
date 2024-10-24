import classNames from 'classnames'
import React, {useState, PropsWithChildren} from 'react'
import {Popover, PopoverProps} from 'reactstrap'

import css from './ChartTooltip.less'
import {TooltipStyle} from './useCustomTooltip'

type Props = {
    title?: string | string[]
    className?: string
    tooltipStyle: TooltipStyle
    target: PopoverProps['target']
}

export const ChartTooltip = ({
    title,
    tooltipStyle,
    className,
    children,
    target,
}: PropsWithChildren<Props>) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Popover
            role="tooltip"
            target={target}
            trigger="focus hover"
            hideArrow
            isOpen={isOpen}
            toggle={() => setIsOpen(!isOpen)}
            popperClassName={classNames(css.tooltip, className)}
            innerClassName={classNames(css.tooltipInner, className)}
            modifiers={{
                computeStyle: {
                    fn: (data) => {
                        return {
                            ...data,
                            styles: {
                                ...data.styles,
                                top:
                                    tooltipStyle.top -
                                    data.offsets.popper.height / 2,
                                left: tooltipStyle.left,
                                opacity: tooltipStyle.opacity,
                                pointerEvents: 'none',
                            } as unknown as CSSStyleDeclaration,
                        }
                    },
                },
            }}
        >
            {title ? <h4 className={classNames(css.title)}>{title}</h4> : null}
            {children}
        </Popover>
    )
}
