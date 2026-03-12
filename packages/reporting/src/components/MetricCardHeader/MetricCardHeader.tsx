import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Icon, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { TooltipData } from '../../types'

import css from './MetricCardHeader.less'

export function MetricCardHeader({
    title,
    hint,
    titleExtra,
    actionMenu,
}: {
    title: ReactNode
    hint?: TooltipData
    titleExtra?: ReactNode
    actionMenu?: ReactNode
}) {
    const titleRef = useRef<HTMLDivElement>(null)
    const [isTitleTruncated, setIsTitleTruncated] = useState(false)

    useEffect(() => {
        const element = titleRef.current
        if (element && typeof title === 'string') {
            setIsTitleTruncated(element.scrollWidth > element.clientWidth)
        }
    }, [title])

    const titleElement = (
        <div ref={titleRef} className={css.titleText}>
            {title}
        </div>
    )

    return (
        <div className={css.wrapper}>
            <div className={css.title}>
                {isTitleTruncated && typeof title === 'string' ? (
                    <Tooltip delay={0} trigger={titleElement}>
                        <TooltipContent title={title} />
                    </Tooltip>
                ) : (
                    titleElement
                )}
                {hint && (
                    <span className={css.infoIcon}>
                        <Tooltip delay={0} trigger={<Icon name="info" />}>
                            <TooltipContent {...hint} />
                        </Tooltip>
                    </span>
                )}
            </div>
            <div
                className={css.actionMenu}
                onClick={(e) => e.stopPropagation()}
            >
                {titleExtra}
                {actionMenu}
            </div>
        </div>
    )
}
