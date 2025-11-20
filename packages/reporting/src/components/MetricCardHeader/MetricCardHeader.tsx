import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Icon, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

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

    const hintTooltipTitle = hint
        ? hint.linkText
            ? `${hint.title}\n${hint.linkText}`
            : hint.title
        : ''

    return (
        <div className={css.wrapper}>
            <div className={css.title}>
                {isTitleTruncated && typeof title === 'string' ? (
                    <Tooltip>
                        <TooltipTrigger>{titleElement}</TooltipTrigger>
                        <TooltipContent title={title} />
                    </Tooltip>
                ) : (
                    titleElement
                )}
                {hint && (
                    <Tooltip>
                        <TooltipTrigger>
                            <Icon name="info" />
                        </TooltipTrigger>
                        <TooltipContent title={hintTooltipTitle} />
                    </Tooltip>
                )}
            </div>
            <div className={css.actionMenu}>
                {titleExtra}
                {actionMenu}
            </div>
        </div>
    )
}
