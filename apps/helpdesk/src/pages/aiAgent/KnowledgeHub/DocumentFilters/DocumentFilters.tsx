import { Button, Icon, MultiButton } from '@gorgias/axiom'

import { HELP_CENTER_SELECT_MODAL_OPEN } from '../constants'
import { dispatchDocumentEvent } from '../EmptyState/utils'
import { KnowledgeType, typeConfig } from '../types'

import css from './DocumentFilters.less'

type DocumentFiltersProps = {
    selectedFilter: KnowledgeType | null
    onFilterChange: (filter: KnowledgeType | null) => void
}

export const DocumentFilters = ({
    selectedFilter,
    onFilterChange,
}: DocumentFiltersProps) => {
    const filters = [
        { type: null, label: 'All content', icon: null },
        ...Object.values(KnowledgeType).map((type) => ({
            type,
            label: typeConfig[type].label,
            icon: typeConfig[type].icon,
        })),
    ]

    const helpCenterSettings = () => {
        dispatchDocumentEvent(HELP_CENTER_SELECT_MODAL_OPEN)
    }

    return (
        <div className={css.container}>
            <MultiButton>
                {filters.map((filter) => {
                    const isSelected = filter.type === selectedFilter
                    return (
                        <Button
                            as="button"
                            intent="regular"
                            key={filter.type || 'all'}
                            variant={isSelected ? 'primary' : 'secondary'}
                            size="md"
                            onClick={() => onFilterChange(filter.type)}
                            leadingSlot={
                                filter.icon && <Icon name={filter.icon} />
                            }
                        >
                            {filter.label}
                        </Button>
                    )
                })}
            </MultiButton>
            {selectedFilter === KnowledgeType.FAQ && (
                <Button
                    variant="secondary"
                    icon="settings"
                    onClick={helpCenterSettings}
                />
            )}
        </div>
    )
}
