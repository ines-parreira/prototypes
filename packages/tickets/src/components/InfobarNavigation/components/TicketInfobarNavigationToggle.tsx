import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

export function InfobarToggle({
    isExpanded,
    onToggle,
}: {
    isExpanded: boolean
    onToggle: () => void
}) {
    return (
        <Tooltip
            placement="left"
            trigger={
                <Button
                    icon={
                        isExpanded ? 'system-bar-collapse' : 'system-bar-expand'
                    }
                    intent="regular"
                    variant="tertiary"
                    onClick={onToggle}
                />
            }
        >
            <TooltipContent
                title={isExpanded ? 'Collapse' : 'Expand'}
                shortcut={']'}
            />
        </Tooltip>
    )
}
