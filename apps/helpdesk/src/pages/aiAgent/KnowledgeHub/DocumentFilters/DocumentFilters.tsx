import { Button, ButtonGroup, ButtonGroupItem, Icon } from '@gorgias/axiom'

import { HELP_CENTER_SELECT_MODAL_OPEN } from 'pages/aiAgent/KnowledgeHub/constants'
import { dispatchDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import { KnowledgeType, typeConfig } from 'pages/aiAgent/KnowledgeHub/types'

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
            <ButtonGroup
                onSelectionChange={(type) => {
                    const selected = filters.find((f) => f.label === type)
                    onFilterChange(selected?.type || null)
                }}
            >
                {filters.map((filter) => {
                    return (
                        <ButtonGroupItem
                            id={filter.label}
                            key={filter.type || 'all'}
                            leadingSlot={
                                filter.icon && <Icon name={filter.icon} />
                            }
                        >
                            {filter.label}
                        </ButtonGroupItem>
                    )
                })}
            </ButtonGroup>
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
