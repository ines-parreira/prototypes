import { Box, Icon, Tooltip, TooltipContent } from '@gorgias/axiom'

type Props = {
    label: string
    sortDirection: false | 'asc' | 'desc'
    tooltipTitle?: string
    tooltipCaption?: string
    className?: string
}

export const SortableHeaderCell = ({
    label,
    sortDirection,
    tooltipTitle,
    tooltipCaption,
    className,
}: Props) => (
    <Box className={className}>
        <span>{label}</span>
        {tooltipTitle && (
            <Tooltip delay={0} trigger={<Icon name="info" size="xs" />}>
                <TooltipContent title={tooltipTitle} caption={tooltipCaption} />
            </Tooltip>
        )}
        <span style={{ visibility: sortDirection ? 'visible' : 'hidden' }}>
            <Icon
                name={sortDirection === 'asc' ? 'arrow-down' : 'arrow-up'}
                size="xs"
            />
        </span>
    </Box>
)
