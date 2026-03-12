import type { CSSProperties, ReactNode } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'

import classNames from 'classnames'

import { Tooltip, TooltipContent } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/TruncateMultilineCellContent.less'

type Props = {
    value?: string
    className?: string
    maxLines?: number
    tooltip?: string
    splitDelimiter?: string
    level1ClassName?: string
    sublevelsClassName?: string
}

export function DrillDownTruncateMultilineCellContent({
    value,
    className,
    maxLines = 2,
    tooltip,
    splitDelimiter,
    level1ClassName,
    sublevelsClassName,
}: Props) {
    const ref = useRef<HTMLDivElement>(null)
    const [isClamped, setIsClamped] = useState(false)

    useLayoutEffect(() => {
        if (ref.current) {
            const el = ref.current
            setIsClamped(el.scrollHeight - 1 > el.clientHeight)
        }
    }, [value])

    const style: CSSProperties = {
        WebkitLineClamp: maxLines,
        lineClamp: maxLines as unknown as CSSProperties['lineClamp'],
    }

    let resolvedContent: ReactNode
    if (splitDelimiter && value?.includes(splitDelimiter)) {
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

    const tooltipContent = tooltip ?? value ?? ''

    const contentElement = (
        <div
            ref={ref}
            className={classNames(css.multiline, className)}
            style={style}
        >
            {resolvedContent}
        </div>
    )

    if (!isClamped) {
        return contentElement
    }

    return (
        <Tooltip placement="top" trigger={contentElement}>
            <TooltipContent caption={tooltipContent} />
        </Tooltip>
    )
}
