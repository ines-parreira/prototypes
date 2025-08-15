import { useId } from '@repo/hooks'

import { Badge, Tooltip } from '@gorgias/axiom'

type DraftBadgeProps = {
    type?: 'promote' | 'exclude'
    variant?: 'main-list' | 'selection-drawer'
}

const TOOLTIP_TEXT_MAP = {
    'main-list': {
        promote:
            'Draft products will be promoted only after they become Active. Until then, Shopping Assistant won’t mention this product.',
        exclude:
            'This product’s status is Draft. It will automatically be excluded once its status changes to Active.',
    },
    'selection-drawer': {
        promote:
            'This product’s status is Draft. You can select it to be promoted, but it will only be mentioned and promoted once its status changes to Active.',
        exclude:
            'This product’s status is Draft. You can select it to be excluded and it will automatically be excluded once its status changes to Active.',
    },
} as const

export const DraftBadge = ({
    type,
    variant = 'main-list',
}: DraftBadgeProps) => {
    const tooltipId = 'draft-badge-tooltip-' + useId()
    const tooltipText = type ? TOOLTIP_TEXT_MAP[variant][type] : null

    return (
        <>
            <span id={tooltipId}>
                <Badge type="light-dark" upperCase={false}>
                    Draft
                </Badge>
            </span>
            {tooltipText && <Tooltip target={tooltipId}>{tooltipText}</Tooltip>}
        </>
    )
}
