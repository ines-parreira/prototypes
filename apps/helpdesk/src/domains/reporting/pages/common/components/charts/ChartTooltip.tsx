import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import classNames from 'classnames'
import type { PopoverProps } from 'reactstrap'
import { Popover } from 'reactstrap'

import css from 'domains/reporting/pages/common/components/charts/ChartTooltip.less'
import type { TooltipStyle } from 'domains/reporting/pages/common/useCustomTooltip'

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
                        const isTooltipOutOfScreen =
                            tooltipStyle.left + data.offsets.popper.width >
                            window.innerWidth
                        return {
                            ...data,
                            styles: {
                                ...data.styles,
                                top:
                                    tooltipStyle.top -
                                    data.offsets.popper.height / 2,
                                left:
                                    tooltipStyle.left -
                                    (isTooltipOutOfScreen
                                        ? data.offsets.popper.width
                                        : 0),
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
