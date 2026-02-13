import {
    Icon,
    LegacyIconButton as IconButton,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

export function InfobarToggle({
    isExpanded,
    onToggle,
}: {
    isExpanded: boolean
    onToggle: () => void
}) {
    return (
        <Tooltip placement="left">
            <TooltipTrigger>
                <IconButton
                    fillStyle="ghost"
                    icon={
                        <Icon
                            name={
                                isExpanded
                                    ? 'system-bar-collapse'
                                    : 'system-bar-expand'
                            }
                            size="md"
                        />
                    }
                    intent="secondary"
                    onClick={() => onToggle()}
                />
            </TooltipTrigger>
            <TooltipContent
                title={isExpanded ? 'Collapse' : 'Expand'}
                shortcut={']'}
            />
        </Tooltip>
    )
}
