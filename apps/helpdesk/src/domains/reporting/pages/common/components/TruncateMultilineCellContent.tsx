import type { CSSProperties } from 'react'
import type React from 'react'
import { useLayoutEffect, useRef, useState } from 'react'

import { useId } from '@repo/hooks'
import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/TruncateMultilineCellContent.less'

type Props = {
    content?: string | React.ReactNode
    className?: string
    maxLines?: number
    tooltip?: string | React.ReactNode
    children?: React.ReactNode
    value?: string
    splitDelimiter?: string
    level1ClassName?: string
    /**
     * When provided, all parts beyond the first will use this class.
     */
    sublevelsClassName?: string
}

export const TruncateMultilineCellContent = ({
    content,
    className,
    maxLines = 2,
    tooltip,
    children,
    value,
    splitDelimiter,
    level1ClassName,
    sublevelsClassName,
}: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isClamped, setIsClamped] = useState(false)
    const randomId = useId()
    const tooltipTargetID = 'truncate-multiline-cell-' + randomId

    useLayoutEffect(() => {
        if (ref.current) {
            const el = ref.current
            setIsClamped(el.scrollHeight - 1 > el.clientHeight)
        }
    }, [])

    const style: CSSProperties = {
        WebkitLineClamp: maxLines,
        lineClamp: maxLines as unknown as CSSProperties['lineClamp'],
    }

    let resolvedContent: React.ReactNode = children ?? content
    if (!resolvedContent && typeof value === 'string') {
        if (splitDelimiter && value.includes(splitDelimiter)) {
            const parts = value.split(splitDelimiter)
            resolvedContent = (
                <>
                    {parts.map((part, idx) => (
                        <div
                            key={idx}
                            className={
                                idx === 0 ? level1ClassName : sublevelsClassName
                            }
                        >
                            {part}
                        </div>
                    ))}
                </>
            )
        } else {
            resolvedContent = <div className={level1ClassName}>{value}</div>
        }
    }

    const tooltipContent =
        tooltip ?? (typeof value === 'string' ? value : content)

    return (
        <>
            <div
                ref={ref}
                id={tooltipTargetID}
                className={classNames(css.multiline, className)}
                style={style}
            >
                {resolvedContent}
            </div>
            <Tooltip
                target={tooltipTargetID}
                trigger={['hover']}
                disabled={!isClamped}
            >
                {tooltipContent}
            </Tooltip>
        </>
    )
}

export default TruncateMultilineCellContent
