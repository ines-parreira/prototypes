import React, { useLayoutEffect, useRef, useState } from 'react'

import { useId } from '@repo/hooks'
import classNames from 'classnames'

import { Tooltip } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/TruncateCellContent.less'

type Props = {
    content: string | React.ReactNode
    className?: string
    left?: boolean
}
export const TruncateCellContent = ({
    content,
    className,
    left = false,
}: Props) => {
    const ref = useRef<HTMLSpanElement>(null)
    const [isEllipsisActive, setIsEllipsisActive] = useState(false)
    const randomId = useId()
    const tooltipTargetID = 'truncate-cell-' + randomId
    // \u2066 wraps a string in Unicode LRI/PDI to enforce LTR rendering inside RTL content
    const isolatedContent =
        typeof content === 'string' && left ? `\u2066${content}\u2069` : content

    useLayoutEffect(() => {
        if (ref.current) {
            setIsEllipsisActive(
                ref.current?.offsetWidth < ref.current?.scrollWidth,
            )
        }
    }, [])

    return (
        <>
            <span
                ref={ref}
                id={tooltipTargetID}
                className={classNames(
                    css.text,
                    {
                        [css.truncate]: isEllipsisActive && left,
                    },
                    className,
                )}
            >
                {isolatedContent}
            </span>
            <Tooltip
                target={tooltipTargetID}
                trigger={['hover']}
                disabled={!isEllipsisActive}
            >
                {content}
            </Tooltip>
        </>
    )
}
