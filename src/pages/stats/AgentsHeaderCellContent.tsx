import React, {useRef} from 'react'
import {useSortingQueries} from 'hooks/reporting/useSortingQueries'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import Tooltip from 'pages/common/components/Tooltip'
import StatsHelpIcon from 'pages/stats/common/components/StatsHelpIcon'
import {HeaderTooltips, TableLabels, TooltipData} from 'pages/stats/TableConfig'
import {TableColumn} from 'state/ui/stats/types'
import {OrderDirection} from 'models/api/types'

const DOCUMENTATION_LINK_TEXT = 'How is it calculated?'

const HeaderTooltipContent = ({title, link}: TooltipData) => {
    return (
        <span>
            {title}
            <br />
            <a href={link}>{DOCUMENTATION_LINK_TEXT}</a>
        </span>
    )
}

type AgentsHeaderCellContentProps = {
    width?: number | string
    justifyContent?: 'left' | 'right' | 'center'
    column: TableColumn
    className?: string
}

export const AgentsHeaderCellContent = ({
    className,
    column,
    width,
    justifyContent,
}: AgentsHeaderCellContentProps) => {
    const {sortCallback, direction, field} = useSortingQueries(column)
    const tooltip = HeaderTooltips[column]
    const isOrderedBy = column === field
    const tooltipRef = useRef<HTMLElement>(null)

    return (
        <HeaderCellProperty
            direction={
                isOrderedBy && direction === OrderDirection.Asc
                    ? OrderDirection.Desc
                    : OrderDirection.Asc
            }
            onClick={sortCallback}
            title={TableLabels[column]}
            isOrderedBy={isOrderedBy}
            wrapContent
            width={width}
            justifyContent={justifyContent}
            className={className}
        >
            {tooltip && (
                <span>
                    <StatsHelpIcon ref={tooltipRef} className={'mr-2'} />
                    <Tooltip
                        boundariesElement={'window'}
                        target={tooltipRef}
                        autohide={false}
                        placement={'top-start'}
                        delay={{show: 0, hide: 500}}
                    >
                        <HeaderTooltipContent {...tooltip} />
                    </Tooltip>
                </span>
            )}
        </HeaderCellProperty>
    )
}
