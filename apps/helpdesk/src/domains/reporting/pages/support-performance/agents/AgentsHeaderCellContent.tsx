import { HintTooltipContent } from 'domains/reporting/pages/common/HintTooltip'
import type { TooltipData } from 'domains/reporting/pages/types'
import { OrderDirection } from 'models/api/types'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

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
    colSpan?: number
}

export const AgentsHeaderCellContent = ({
    className,
    width,
    justifyContent,
    title,
    hint,
    useSortingQuery,
    colSpan = 1,
}: AgentsHeaderCellContentProps) => {
    const { sortCallback, direction, isOrderedBy } = useSortingQuery()
    const tooltip = hint ? <HintTooltipContent {...hint} /> : null

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
            colSpan={colSpan}
            tooltip={tooltip}
        />
    )
}
