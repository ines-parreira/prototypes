import React from 'react'

import { OrderDirection } from 'models/api/types'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import { HintTooltip } from 'pages/stats/common/HintTooltip'
import { TooltipData } from 'pages/stats/types'

type AgentsHeaderCellContentProps = {
    width?: number | string
    justifyContent?: 'left' | 'right' | 'center'
    className?: string
    title: string
    hint: TooltipData | null
    useSortingQuery: () => {
        sortCallback: () => void
        direction: OrderDirection
        isOrderedBy: boolean
    }
}

export const AgentsHeaderCellContent = ({
    className,
    width,
    justifyContent,
    title,
    hint,
    useSortingQuery,
}: AgentsHeaderCellContentProps) => {
    const { sortCallback, direction, isOrderedBy } = useSortingQuery()

    return (
        <HeaderCellProperty
            direction={
                isOrderedBy && direction === OrderDirection.Asc
                    ? OrderDirection.Desc
                    : OrderDirection.Asc
            }
            onClick={sortCallback}
            title={title}
            isOrderedBy={isOrderedBy}
            wrapContent
            width={width}
            justifyContent={justifyContent}
            className={className}
        >
            {hint && <HintTooltip {...hint} />}
        </HeaderCellProperty>
    )
}
