import {
    Box,
    Icon,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

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
            <Tooltip delay={0}>
                <TooltipTrigger>
                    <Icon name="info" size="xs" />
                </TooltipTrigger>
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
