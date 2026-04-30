import { Fragment } from 'react'

import {
    Button,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    Separator,
} from '@gorgias/axiom'

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
    const knowledgeTypeOrder = [
        KnowledgeType.Guidance,
        KnowledgeType.FAQ,
        KnowledgeType.Domain,
        KnowledgeType.URL,
        KnowledgeType.Document,
    ]

    const filters = [
        { type: null, label: 'All content', icon: null },
        ...knowledgeTypeOrder.map((type) => ({
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
            <div className={css.buttonGroup}>
                <ButtonGroup
                    onSelectionChange={(type) => {
                        const selected = filters.find((f) => f.label === type)
                        onFilterChange(selected?.type || null)
                    }}
                    selectedKey={
                        selectedFilter
                            ? typeConfig[selectedFilter].label
                            : 'All content'
                    }
                >
                    {filters.map((filter, index) => {
                        return (
                            <Fragment key={filter.type || 'all'}>
                                <ButtonGroupItem
                                    id={filter.label}
                                    leadingSlot={
                                        filter.icon && (
                                            <Icon name={filter.icon} />
                                        )
                                    }
                                >
                                    {filter.label}
                                </ButtonGroupItem>
                                {index === 0 && (
                                    <Separator direction="vertical" />
                                )}
                            </Fragment>
                        )
                    })}
                </ButtonGroup>
            </div>
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
