import { Icon, StatusButton } from '@gorgias/axiom'
import { startCase } from '@gorgias/toolkit'

import type { MacroAction } from 'models/macroAction/types'

const PRIORITY_PREVIEW_MAP = {
    low: {
        icon: 'arrow-chevron-down',
        iconColor: 'grey',
        label: 'Low',
    },
    normal: {
        icon: 'equals',
        iconColor: 'grey',
        label: 'Normal',
    },
    high: {
        icon: 'arrow-chevron-up',
        iconColor: 'orange',
        label: 'High',
    },
    critical: {
        icon: 'arrow-chevron-up-duo',
        iconColor: 'red',
        label: 'Critical',
    },
} as const

type PriorityPreviewProps = {
    priority?: MacroAction['arguments']['priority']
}

export function PriorityPreview({ priority }: PriorityPreviewProps) {
    const normalizedPriority = priority ?? 'normal'
    const config = PRIORITY_PREVIEW_MAP[normalizedPriority] ?? {
        icon: 'equals',
        iconColor: 'grey',
        label: startCase(normalizedPriority),
    }

    return (
        <StatusButton
            leadingSlot={
                <Icon name={config.icon} size="sm" color={config.iconColor} />
            }
        >
            {config.label}
        </StatusButton>
    )
}
