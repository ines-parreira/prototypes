import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Box, Button, Icon, Popover, SearchField, Text } from '@gorgias/axiom'

import type { ConditionField, ConditionFieldCategory } from '../types'

import css from './ConditionVariablePicker.less'

type Props = {
    fields: ConditionField[]
    categories?: ConditionFieldCategory[]
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onSelect: (field: ConditionField) => void
    trigger: ReactNode
    isDisabled?: boolean
    /**
     * Maximum number of fields per uncategorized result list. Mostly useful to
     * keep the UI bounded for the playground; the original picker has no limit.
     */
    maxFlatResults?: number
}

const UNCATEGORIZED_ID = '__uncategorized__'

export const ConditionVariablePicker = ({
    fields,
    categories,
    isOpen,
    onOpenChange,
    onSelect,
    trigger,
    isDisabled,
    maxFlatResults,
}: Props) => {
    const [search, setSearch] = useState('')
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
        null,
    )

    useEffect(() => {
        if (!isOpen) {
            setSearch('')
            setActiveCategoryId(null)
        }
    }, [isOpen])

    const trimmedSearch = search.trim().toLowerCase()
    const isSearching = trimmedSearch.length > 0

    const fieldsByCategory = useMemo(() => {
        const map = new Map<string, ConditionField[]>()
        fields.forEach((field) => {
            const key = field.category ?? UNCATEGORIZED_ID
            const list = map.get(key) ?? []
            list.push(field)
            map.set(key, list)
        })
        return map
    }, [fields])

    const visibleCategories = useMemo(() => {
        if (!categories) return []
        return categories.filter(
            (category) => (fieldsByCategory.get(category.id) ?? []).length > 0,
        )
    }, [categories, fieldsByCategory])

    const activeCategory = useMemo(
        () => visibleCategories.find((c) => c.id === activeCategoryId) ?? null,
        [visibleCategories, activeCategoryId],
    )

    const matchesSearch = useCallback(
        (field: ConditionField) =>
            !isSearching || field.label.toLowerCase().includes(trimmedSearch),
        [isSearching, trimmedSearch],
    )

    const filteredCategories = useMemo(() => {
        if (!isSearching) return visibleCategories
        return visibleCategories.filter((category) =>
            (fieldsByCategory.get(category.id) ?? []).some(matchesSearch),
        )
    }, [visibleCategories, fieldsByCategory, isSearching, matchesSearch])

    const flatResults = useMemo(() => {
        let list = activeCategory
            ? (fieldsByCategory.get(activeCategory.id) ?? [])
            : fields
        if (isSearching) {
            list = list.filter(matchesSearch)
        }
        if (!activeCategory && maxFlatResults !== undefined) {
            list = list.slice(0, maxFlatResults)
        }
        return list
    }, [
        activeCategory,
        fieldsByCategory,
        fields,
        isSearching,
        matchesSearch,
        maxFlatResults,
    ])

    const hasCategories = visibleCategories.length > 0

    const showCategoryList =
        hasCategories &&
        !activeCategory &&
        !isSearching &&
        filteredCategories.length > 0

    const showFlatResults = activeCategory || isSearching || !hasCategories

    const handleSelect = (field: ConditionField) => {
        onSelect(field)
        onOpenChange(false)
    }

    const handleBack = () => {
        setActiveCategoryId(null)
        setSearch('')
    }

    return (
        <Popover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            trigger={trigger}
            placement="bottom left"
            minWidth={320}
            maxHeight={400}
            padding="xxs"
            elevation="high"
            aria-label="Insert variable"
        >
            <Box flexDirection="column" gap="xs" width="100%">
                {activeCategory ? (
                    <Box
                        flexDirection="row"
                        alignItems="center"
                        gap="xxs"
                        paddingLeft="xxs"
                        paddingRight="xxs"
                    >
                        <Button
                            as="button"
                            variant="tertiary"
                            size="sm"
                            intent="regular"
                            icon="arrow-chevron-left"
                            aria-label="Back to categories"
                            onClick={handleBack}
                            isDisabled={isDisabled}
                        />
                        <Text size="sm" variant="medium">
                            {activeCategory.label}
                        </Text>
                    </Box>
                ) : (
                    <SearchField
                        value={search}
                        onChange={setSearch}
                        onClear={() => setSearch('')}
                        placeholder="Search for a variable"
                        aria-label="Search for a variable"
                        autoFocus
                    />
                )}

                {showCategoryList && (
                    <Box flexDirection="column" gap="xxxs">
                        <div className={css.sectionHeader}>INSERT VARIABLE</div>
                        {filteredCategories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                className={css.row}
                                onClick={() => setActiveCategoryId(category.id)}
                                disabled={isDisabled}
                            >
                                <span className={css.rowIcon}>
                                    {category.iconName ? (
                                        <Icon
                                            name={category.iconName as never}
                                            size="sm"
                                        />
                                    ) : null}
                                </span>
                                <span className={css.rowLabel}>
                                    {category.label}
                                </span>
                                <Icon name="arrow-chevron-right" size="sm" />
                            </button>
                        ))}
                    </Box>
                )}

                {showFlatResults && (
                    <Box flexDirection="column" gap="xxxs">
                        {!activeCategory && isSearching && (
                            <div className={css.sectionHeader}>
                                INSERT VARIABLE
                            </div>
                        )}
                        {flatResults.length === 0 ? (
                            <Box paddingLeft="xs" paddingRight="xs">
                                <Text
                                    size="sm"
                                    color="content-neutral-secondary"
                                >
                                    No results
                                </Text>
                            </Box>
                        ) : (
                            flatResults.map((field) => (
                                <button
                                    key={field.id}
                                    type="button"
                                    className={css.row}
                                    onClick={() => handleSelect(field)}
                                    disabled={isDisabled}
                                >
                                    <span className={css.rowLabel}>
                                        {field.label}
                                    </span>
                                </button>
                            ))
                        )}
                    </Box>
                )}
            </Box>
        </Popover>
    )
}
