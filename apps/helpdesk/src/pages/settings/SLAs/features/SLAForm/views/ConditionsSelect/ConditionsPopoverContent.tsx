import { Box, SearchField } from '@gorgias/axiom'
import type { Tag } from '@gorgias/helpdesk-queries'

import type { ChoicesTree } from 'custom-fields/components/MultiLevelSelect/types'
import type { CustomField } from 'custom-fields/types'
import { InfiniteScroll } from 'pages/common/components/InfiniteScroll/InfiniteScroll'

import { BackButton } from './BackButton'
import { ClearAllFooter } from './ClearAllFooter'
import { RootLevel } from './RootLevel'
import { TagsLevel } from './TagsLevel'
import { TicketFieldsLevel } from './TicketFieldsLevel'
import { TicketFieldValuesLevel } from './TicketFieldValuesLevel'
import type {
    ConditionItem,
    ConditionsFormValue,
    DrilldownLevel,
} from './types'

import css from './ConditionsPopoverContent.less'

type ConditionsPopoverContentProps = {
    level: DrilldownLevel
    searchQuery: string
    selectedConditions: ConditionsFormValue
    tags: Tag[]
    dropdownFields: CustomField[]
    getFieldChoices: (fieldId: number) => string[]
    getFieldTree: (fieldId: number) => ChoicesTree
    isLoadingTags: boolean
    isLoadingFields: boolean
    onLoadMoreTags: () => Promise<unknown>
    shouldLoadMoreTags: boolean
    maxSelections?: number
    onNavigate: (level: DrilldownLevel) => void
    onSearchChange: (query: string) => void
    onToggleCondition: (item: ConditionItem) => void
    onClearAll: () => void
}

export function ConditionsPopoverContent({
    level,
    searchQuery,
    selectedConditions,
    tags,
    dropdownFields,
    getFieldChoices,
    getFieldTree,
    isLoadingTags,
    isLoadingFields,
    onLoadMoreTags,
    shouldLoadMoreTags,
    maxSelections,
    onNavigate,
    onSearchChange,
    onToggleCondition,
    onClearAll,
}: ConditionsPopoverContentProps) {
    return (
        <Box flexDirection="column" className={css.popoverContent}>
            {level.type !== 'root' && (
                <BackButton level={level} onNavigate={onNavigate} />
            )}
            <Box className={css.searchWrapper}>
                <SearchField
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Search..."
                    size="sm"
                    aria-label="Search conditions"
                    variant="secondary"
                />
            </Box>
            <InfiniteScroll
                className={css.listContainer}
                onLoad={onLoadMoreTags}
                shouldLoadMore={shouldLoadMoreTags && level.type === 'tags'}
            >
                {level.type === 'root' && (
                    <RootLevel
                        searchQuery={searchQuery}
                        tags={tags}
                        dropdownFields={dropdownFields}
                        getFieldChoices={getFieldChoices}
                        selectedConditions={selectedConditions}
                        isLoadingTags={isLoadingTags}
                        isLoadingFields={isLoadingFields}
                        maxSelections={maxSelections}
                        onLoadMoreTags={onLoadMoreTags}
                        shouldLoadMoreTags={shouldLoadMoreTags}
                        onNavigate={onNavigate}
                        onToggleCondition={onToggleCondition}
                    />
                )}
                {level.type === 'tags' && (
                    <TagsLevel
                        tags={tags}
                        selectedConditions={selectedConditions}
                        isLoading={isLoadingTags}
                        maxSelections={maxSelections}
                        onToggle={onToggleCondition}
                    />
                )}
                {level.type === 'ticket_fields' && (
                    <TicketFieldsLevel
                        fields={dropdownFields}
                        searchQuery={searchQuery}
                        isLoading={isLoadingFields}
                        getFieldChoices={getFieldChoices}
                        selectedConditions={selectedConditions}
                        maxSelections={maxSelections}
                        onNavigate={onNavigate}
                        onToggle={onToggleCondition}
                    />
                )}
                {level.type === 'ticket_field_values' && (
                    <TicketFieldValuesLevel
                        tree={getFieldTree(level.fieldId)}
                        path={level.path}
                        fieldId={level.fieldId}
                        fieldLabel={level.fieldLabel}
                        searchQuery={searchQuery}
                        selectedConditions={selectedConditions}
                        maxSelections={maxSelections}
                        onNavigate={onNavigate}
                        onToggle={onToggleCondition}
                    />
                )}
            </InfiniteScroll>
            <ClearAllFooter
                selectedConditions={selectedConditions}
                onClear={onClearAll}
            />
        </Box>
    )
}
