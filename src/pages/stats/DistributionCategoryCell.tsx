import React, {PropsWithRef, useRef, useLayoutEffect, useState} from 'react'
import classNames from 'classnames'

import colors from 'assets/tokens/colors.json'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import GaugeCellAddon from 'pages/common/components/table/addons/GaugeCellAddon'
import Tooltip from 'pages/common/components/Tooltip'
import {
    TICKET_CUSTOM_FIELDS_API_SEPARATOR,
    TICKET_CUSTOM_FIELDS_NEW_SEPARATOR,
} from './utils'
import css from './DistributionCategoryCell.less'

type Props = {
    category: string
    progress: number
}

const cellColor = colors['📺 Classic'].Accessory.Blue_bg.value

export const DistributionCategoryCell = ({
    category,
    progress,
    ...props
}: PropsWithRef<BodyCellProps> & Props) => {
    const ref = useRef<HTMLSpanElement>(null)
    const [isEllipsisActive, setIsEllipsisActive] = useState(false)

    useLayoutEffect(() => {
        if (ref.current) {
            setIsEllipsisActive(
                ref.current?.offsetWidth < ref.current?.scrollWidth
            )
        }
    }, [])

    const content = category
        ?.split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)
        .join(TICKET_CUSTOM_FIELDS_NEW_SEPARATOR)

    const tooltipTargetID = `category-${category.replace(/[^a-zA-Z0-9]/g, '_')}`

    return (
        <BodyCell {...props}>
            <GaugeCellAddon progress={progress} color={cellColor} />
            <span
                ref={ref}
                id={tooltipTargetID}
                className={classNames(css.text, {
                    [css.truncate]: isEllipsisActive,
                })}
            >
                {content}
            </span>
            <Tooltip target={tooltipTargetID} trigger={['hover']}>
                {content}
            </Tooltip>
        </BodyCell>
    )
}
