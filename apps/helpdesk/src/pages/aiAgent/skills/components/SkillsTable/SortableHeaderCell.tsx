import { Box, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import css from './SortableHeaderCell.less'

interface SortableHeaderCellProps {
    label: string
    sortDirection: false | 'asc' | 'desc'
    tooltipTitle?: string
}

export const SortableHeaderCell = ({
    label,
    sortDirection,
    tooltipTitle,
}: SortableHeaderCellProps) => {
    return (
        <Box flexDirection="row" alignItems="center" gap="xxxs">
            <Text
                size="sm"
                variant="bold"
                color={sortDirection ? 'content-neutral-default' : undefined}
            >
                {label}
            </Text>
            {tooltipTitle && (
                <Tooltip trigger={<Icon name="info" size="sm" />}>
                    <TooltipContent title={tooltipTitle} />
                </Tooltip>
            )}
            <span
                className={
                    sortDirection ? css.sortIndicatorVisible : css.sortIndicator
                }
            >
                <Icon
                    name={sortDirection === 'asc' ? 'arrow-down' : 'arrow-up'}
                    size="xs"
                />
            </span>
        </Box>
    )
}
