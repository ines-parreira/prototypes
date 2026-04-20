import { useMemo } from 'react'

import { Box, Icon, Text } from '@gorgias/axiom'

import { fromTreeKey } from 'custom-fields/components/MultiLevelSelect/helpers/buildTreeOfChoices'
import { getFullValueFromCurrentPath } from 'custom-fields/components/MultiLevelSelect/helpers/getFullValueFromCurrentPath'
import type { ChoicesTree } from 'custom-fields/components/MultiLevelSelect/types'
import { getValueLabel } from 'custom-fields/helpers/getValueLabels'

import { ConditionCheckBoxField } from './ConditionCheckBoxField'
import { LevelEmptyState } from './LevelStates'
import type {
    ConditionItem,
    ConditionsFormValue,
    DrilldownLevel,
} from './types'
import { makeConditionItem } from './types'

import css from './ConditionsPopoverContent.less'

function getNodesAtPath(tree: ChoicesTree, path: string[]): ChoicesTree {
    let current = tree
    for (const key of path) {
        const node = current.get(key)
        if (!node) return new Map()
        current = node.children
    }
    return current
}

type MatchedLeaf = {
    key: string
    fullValue: string
    displayLabel: string
}

function collectMatchingLeaves(
    tree: ChoicesTree,
    query: string,
    pathSoFar: string[],
    fieldLabel: string,
): MatchedLeaf[] {
    const results: MatchedLeaf[] = []
    for (const [key, node] of tree) {
        const label = fromTreeKey(key)
        if (node.value !== null && label.toLowerCase().includes(query)) {
            const fullValue = getFullValueFromCurrentPath(
                pathSoFar,
                node.value,
            ) as string
            results.push({
                key: `${pathSoFar.join('-')}-${key}`,
                fullValue,
                displayLabel: `${fieldLabel} / ${getValueLabel(fullValue)}`,
            })
        }
        if (node.children.size > 0) {
            results.push(
                ...collectMatchingLeaves(
                    node.children,
                    query,
                    [...pathSoFar, key],
                    fieldLabel,
                ),
            )
        }
    }
    return results
}

export function TicketFieldValuesLevel({
    tree,
    path,
    fieldId,
    fieldLabel,
    searchQuery,
    selectedConditions,
    isAtLimit,
    onNavigate,
    onToggle,
}: {
    tree: ChoicesTree
    path: string[]
    fieldId: number
    fieldLabel: string
    searchQuery: string
    selectedConditions: ConditionsFormValue
    isAtLimit: boolean
    onNavigate: (level: DrilldownLevel) => void
    onToggle: (item: ConditionItem) => void
}) {
    const currentNodes = useMemo(() => getNodesAtPath(tree, path), [tree, path])

    const searchResults = useMemo(() => {
        if (!searchQuery) return null
        const query = searchQuery.toLowerCase()
        return collectMatchingLeaves(currentNodes, query, path, fieldLabel)
    }, [currentNodes, searchQuery, path, fieldLabel])

    if (searchResults) {
        if (searchResults.length === 0) {
            return <LevelEmptyState />
        }

        return (
            <Box flexDirection="column" padding="xs" gap="xxxs">
                {searchResults.map((match) => (
                    <ConditionCheckBoxField
                        key={match.key}
                        condition={makeConditionItem(
                            'ticket_fields',
                            fieldId,
                            match.fullValue,
                            match.displayLabel,
                        )}
                        label={match.displayLabel}
                        selectedConditions={selectedConditions}
                        isAtLimit={isAtLimit}
                        onToggle={onToggle}
                    />
                ))}
            </Box>
        )
    }

    const entries = Array.from(currentNodes.entries())

    if (entries.length === 0) {
        return <LevelEmptyState />
    }

    return (
        <Box flexDirection="column" padding="xs" gap="xxxs">
            {entries.map(([key, node]) => {
                const label = fromTreeKey(key)
                const isBranch = node.value === null

                if (isBranch) {
                    return (
                        <button
                            key={key}
                            type="button"
                            className={css.drilldownRow}
                            onClick={() =>
                                onNavigate({
                                    type: 'ticket_field_values',
                                    fieldId,
                                    fieldLabel,
                                    path: [...path, key],
                                })
                            }
                        >
                            <Text size="md">{label}</Text>
                            <Icon name="arrow-chevron-right" size="sm" />
                        </button>
                    )
                }

                const fullValue = getFullValueFromCurrentPath(
                    path,
                    node.value!,
                ) as string
                const displayLabel = `${fieldLabel} / ${getValueLabel(fullValue)}`

                return (
                    <ConditionCheckBoxField
                        key={key}
                        condition={makeConditionItem(
                            'ticket_fields',
                            fieldId,
                            fullValue,
                            displayLabel,
                        )}
                        label={label}
                        selectedConditions={selectedConditions}
                        isAtLimit={isAtLimit}
                        onToggle={onToggle}
                    />
                )
            })}
        </Box>
    )
}
