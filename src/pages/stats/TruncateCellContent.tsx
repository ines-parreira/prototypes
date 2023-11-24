import React, {useRef, useLayoutEffect, useState} from 'react'
import classNames from 'classnames'

import useId from 'hooks/useId'
import Tooltip from 'pages/common/components/Tooltip'
import css from './TruncateCellContent.less'

type Props = {
    content: string
    className?: string
}
export const TruncateCellContent = ({content, className}: Props) => {
    const ref = useRef<HTMLSpanElement>(null)
    const [isEllipsisActive, setIsEllipsisActive] = useState(false)
    const randomId = useId()
    const tooltipTargetID = 'truncate-cell-' + randomId

    useLayoutEffect(() => {
        if (ref.current) {
            setIsEllipsisActive(
                ref.current?.offsetWidth < ref.current?.scrollWidth
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
                        [css.truncate]: isEllipsisActive,
                    },
                    className
                )}
            >
                {content}
            </span>
            <Tooltip target={tooltipTargetID} trigger={['hover']}>
                {content}
            </Tooltip>
        </>
    )
}
