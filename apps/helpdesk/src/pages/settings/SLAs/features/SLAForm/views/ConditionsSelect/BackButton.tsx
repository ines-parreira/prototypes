import { Icon, Text } from '@gorgias/axiom'

import { fromTreeKey } from 'custom-fields/components/MultiLevelSelect/helpers/buildTreeOfChoices'

import type { DrilldownLevel } from './types'

import css from './ConditionsPopoverContent.less'

export function BackButton({
    level,
    onNavigate,
}: {
    level: DrilldownLevel
    onNavigate: (level: DrilldownLevel) => void
}) {
    const getParentLevel = (): DrilldownLevel => {
        if (level.type === 'tags' || level.type === 'ticket_fields') {
            return { type: 'root' }
        }
        if (level.type === 'ticket_field_values') {
            if (level.path.length > 0) {
                return { ...level, path: level.path.slice(0, -1) }
            }
            return { type: 'ticket_fields' }
        }
        return { type: 'root' }
    }

    const getLabel = (): string => {
        if (level.type === 'tags') return 'Tags'
        if (level.type === 'ticket_fields') return 'Ticket fields'
        if (level.type === 'ticket_field_values') {
            if (level.path.length > 0) {
                return fromTreeKey(level.path[level.path.length - 1])
            }
            return level.fieldLabel
        }
        return ''
    }

    return (
        <button
            type="button"
            className={css.backButton}
            onClick={() => onNavigate(getParentLevel())}
        >
            <Icon name="arrow-chevron-left" size="sm" />
            <Text variant="medium" size="md">
                {getLabel()}
            </Text>
        </button>
    )
}
