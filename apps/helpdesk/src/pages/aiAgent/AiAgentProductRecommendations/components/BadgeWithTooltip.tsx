import { useId } from '@repo/hooks'

import { Badge, ColorType, LegacyTooltip as Tooltip } from '@gorgias/axiom'

type BadgeWithTooltipProps = {
    label: string
    type: ColorType
    tooltip?: string
}
export const BadgeWithTooltip = ({
    label,
    type,
    tooltip,
}: BadgeWithTooltipProps) => {
    const tooltipId = 'badge-tooltip-' + useId()

    return (
        <div>
            <span id={tooltipId}>
                <Badge type={type} upperCase={false} corner="square">
                    {label}
                </Badge>
            </span>
            {tooltip && <Tooltip target={tooltipId}>{tooltip}</Tooltip>}
        </div>
    )
}
