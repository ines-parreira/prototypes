import React, { useLayoutEffect, useRef, useState } from 'react'

import classNames from 'classnames'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'

import css from './TruncateCellContent.less'

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
                {content}
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
