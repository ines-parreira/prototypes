import { useCallback, useEffect, useRef, useState } from 'react'

import { useController } from '@repo/forms'
import { useDebouncedEffect } from '@gorgias/toolkit-react'

import {
    Box,
    DropdownIcon,
    Icon,
    Label,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
    Tag,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useOnClickOutside } from 'pages/common/hooks/useOnClickOutside'

import { ConditionsPopoverContent } from './ConditionsPopoverContent'
import type {
    ConditionItem,
    ConditionsFormValue,
    DrilldownLevel,
} from './types'
import { getShortLabel, isConditionDisabled, isSameCondition } from './types'
import useConditionsData from './useConditionsData'

import css from './ConditionsSelectBox.less'

const FIELD_NAME = 'conditions'

type ConditionsSelectBoxProps = {
    maxSelections?: number
}

export function ConditionsSelectBox({
    maxSelections,
}: ConditionsSelectBoxProps) {
    const { field } = useController<{ conditions: ConditionsFormValue }>({
        name: FIELD_NAME,
    })

    const [isOpen, setIsOpen] = useState(false)
    const [level, setLevel] = useState<DrilldownLevel>({ type: 'root' })
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    useDebouncedEffect(
        () => setDebouncedSearchQuery(searchQuery),
        [searchQuery],
        300,
    )

    const tagsSearchQuery =
        level.type === 'tags'
            ? searchQuery
            : level.type === 'root' && searchQuery
              ? debouncedSearchQuery
              : ''

    const {
        tags,
        isLoadingTags,
        onLoadMoreTags,
        shouldLoadMoreTags,
        dropdownFields,
        isLoadingFields,
        getFieldChoices,
        getFieldTree,
    } = useConditionsData(tagsSearchQuery)

    const selectedConditions = (field.value ?? []) as ConditionsFormValue
    const hasSelection = selectedConditions.length > 0

    const closePopover = useCallback(() => setIsOpen(false), [])
    useOnClickOutside(containerRef, closePopover)

    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen])

    const handleNavigate = useCallback((newLevel: DrilldownLevel) => {
        setLevel(newLevel)
        setSearchQuery('')
    }, [])

    const handleToggleCondition = useCallback(
        (item: ConditionItem) => {
            const current = (field.value ?? []) as ConditionsFormValue
            if (isConditionDisabled(item, current, maxSelections)) return

            const exists = current.some((c) => isSameCondition(c, item))
            const nextValue = exists
                ? current.filter((c) => !isSameCondition(c, item))
                : [...current, item]

            field.onChange(nextValue)
        },
        [field, maxSelections],
    )

    const handleClearAll = useCallback(() => {
        field.onChange([])
    }, [field])

    const handleToggleOpen = () => {
        const nextOpen = !isOpen
        setIsOpen(nextOpen)
        if (nextOpen) {
            setLevel({ type: 'root' })
            setSearchQuery('')
        }
    }

    return (
        <div ref={containerRef} className={css.container}>
            <Box flexDirection="column" className={css.wrapper}>
                <Box alignItems="center" gap="xxxxs" marginBottom="xxxxs">
                    <Label
                        className={css.toggleLabel}
                        as="span"
                        onClick={handleToggleOpen}
                    >
                        Conditions
                    </Label>
                    <Tooltip
                        trigger={
                            <span
                                tabIndex={0}
                                aria-label="More information"
                                className={css.infoIcon}
                            >
                                <Icon name="info" size="sm" />
                            </span>
                        }
                    >
                        <TooltipContent title="Use conditions to target this SLA to specific types of tickets. All conditions must match for this SLA to apply." />
                    </Tooltip>
                </Box>
                <button
                    type="button"
                    className={css.triggerButton}
                    onClick={handleToggleOpen}
                    aria-expanded={isOpen}
                >
                    {hasSelection ? (
                        <OverflowList gap="xxxs" className={css.tagList}>
                            {selectedConditions.map((item) => (
                                <OverflowListItem
                                    key={`${item.category}-${item.fieldId}-${item.value}`}
                                    className={css.tagItem}
                                >
                                    {item.category === 'ticket_fields' ? (
                                        <Tooltip
                                            trigger={
                                                <span>
                                                    <Tag
                                                        onClose={() =>
                                                            handleToggleCondition(
                                                                item,
                                                            )
                                                        }
                                                    >
                                                        {getShortLabel(item)}
                                                    </Tag>
                                                </span>
                                            }
                                        >
                                            <TooltipContent
                                                title={item.displayLabel}
                                            />
                                        </Tooltip>
                                    ) : (
                                        <Tag
                                            onClose={() =>
                                                handleToggleCondition(item)
                                            }
                                        >
                                            {item.displayLabel}
                                        </Tag>
                                    )}
                                </OverflowListItem>
                            ))}
                            <OverflowListShowMore />
                            <OverflowListShowLess />
                        </OverflowList>
                    ) : (
                        <Text className={css.placeholder}>Select</Text>
                    )}
                    {maxSelections !== undefined &&
                        selectedConditions.length > 0 && (
                            <Tag
                                color={
                                    selectedConditions.length === maxSelections
                                        ? 'red'
                                        : 'grey'
                                }
                            >
                                {selectedConditions.length}/{maxSelections}
                            </Tag>
                        )}
                    <Box className={css.iconWrapper}>
                        <DropdownIcon isOpen={isOpen} />
                    </Box>
                </button>
                {maxSelections !== undefined && (
                    <Text
                        size="sm"
                        color="var(--content-neutral-secondary)"
                        className={css.helperText}
                    >
                        Choose up to {maxSelections} conditions.
                    </Text>
                )}
                {isOpen && (
                    <div className={css.popover}>
                        <ConditionsPopoverContent
                            level={level}
                            searchQuery={searchQuery}
                            selectedConditions={selectedConditions}
                            tags={tags}
                            dropdownFields={dropdownFields}
                            getFieldChoices={getFieldChoices}
                            getFieldTree={getFieldTree}
                            isLoadingTags={isLoadingTags}
                            isLoadingFields={isLoadingFields}
                            onLoadMoreTags={onLoadMoreTags}
                            shouldLoadMoreTags={shouldLoadMoreTags}
                            maxSelections={maxSelections}
                            onNavigate={handleNavigate}
                            onSearchChange={setSearchQuery}
                            onToggleCondition={handleToggleCondition}
                            onClearAll={handleClearAll}
                        />
                    </div>
                )}
            </Box>
        </div>
    )
}
