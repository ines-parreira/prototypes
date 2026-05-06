import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { DateFormatPreference } from 'AIJourney/hooks'

type DateFormatToggleProps = {
    format: DateFormatPreference
    onToggle: () => void
}

export const DateFormatToggle = ({
    format,
    onToggle,
}: DateFormatToggleProps) => {
    const isRelative = format === 'relative'
    const tooltip = isRelative
        ? 'Switch to absolute timestamps'
        : 'Switch to relative timestamps'
    const label = isRelative ? 'Relative' : 'Absolute'
    const icon = isRelative ? 'clock' : 'calendar'

    return (
        <Tooltip
            trigger={
                <Button
                    onClick={onToggle}
                    intent="regular"
                    leadingSlot={icon}
                    size="sm"
                    variant="tertiary"
                >
                    {label}
                </Button>
            }
        >
            <TooltipContent title={tooltip} />
        </Tooltip>
    )
}
