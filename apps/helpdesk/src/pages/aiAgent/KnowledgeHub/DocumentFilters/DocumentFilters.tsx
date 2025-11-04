import { Button, ButtonGroup, Icon } from '@gorgias/axiom'

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

    return (
        <div className={css.container}>
            <ButtonGroup>
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
            </ButtonGroup>
        </div>
    )
}
