import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

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
                <Button
                    icon={
                        isExpanded ? 'system-bar-collapse' : 'system-bar-expand'
                    }
                    intent="regular"
                    variant="tertiary"
                    onClick={onToggle}
                />
            </TooltipTrigger>
            <TooltipContent
                title={isExpanded ? 'Collapse' : 'Expand'}
                shortcut={']'}
            />
        </Tooltip>
    )
}
