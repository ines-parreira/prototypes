import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import classNames from 'classnames'

import { Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { TooltipData } from '../../types'

import css from './MetricCardHeader.less'

export function MetricCardHeader({
    title,
    hint,
    titleExtra,
    actionMenu,
    compact = false,
}: {
    title: ReactNode
    hint?: TooltipData
    titleExtra?: ReactNode
    actionMenu?: ReactNode
    compact?: boolean
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

    const link =
        hint?.link != null ? (
            <a
                href={hint.link}
                target="_blank"
                rel="noopener noreferrer"
                className={css.tooltipLink}
            >
                {hint.linkText}
            </a>
        ) : undefined

    // TooltipContent renders in its own portal, so CSS inheritance from a wrapper
    // div does not reach it. When the caption has newlines we pass custom children
    // so we can apply white-space: pre-wrap directly inside the portal.
    const hintTooltipContent = hint?.caption?.includes('\n') ? (
        <TooltipContent>
            {hint.title && (
                <div className={css.tooltipTitle}>
                    <Text size="sm" variant="bold">
                        {hint.title}
                    </Text>
                </div>
            )}
            {(hint.caption || link) && (
                <div className={css.innerTooltip}>
                    {hint.caption && <Text size="sm">{hint.caption}</Text>}
                    {link}
                </div>
            )}
        </TooltipContent>
    ) : (
        <TooltipContent
            title={hint?.title}
            caption={hint?.caption}
            link={link}
        />
    )

    return (
        <div className={css.wrapper}>
            <div
                className={classNames(css.title, {
                    [css.titleCompact]: compact,
                })}
            >
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
                            {hintTooltipContent}
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
