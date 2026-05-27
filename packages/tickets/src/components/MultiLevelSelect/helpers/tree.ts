import { NESTING_DELIMITER } from '../constants'
import type { TreeOption, TreeValue } from '../types'
import { OptionEnum } from '../types'

type TreeNode = {
    value: TreeValue | null
    children: Map<string, TreeNode>
}

/**
 * Builds a tree structure from an array of choice values
 * ("Level1::Level2" for strings, or flat values for booleans)
 */
export function buildTreeFromChoices(
    choices: TreeValue[],
): Map<string, TreeNode> {
    const root = new Map<string, TreeNode>()

    choices.forEach((choice) => {
        // For boolean values and other values, treat as flat (no nesting)
        // fyi: other types are not expected to appear as values in a dropdown scenario
        const path =
            typeof choice === 'string'
                ? choice.split(NESTING_DELIMITER)
                : [
                      typeof choice === 'boolean'
                          ? choice
                              ? 'boolean.true'
                              : 'boolean.false'
                          : String(choice),
                  ]
        let currentLevel = root

        path.forEach((segment, index) => {
            const isLeaf = index === path.length - 1

            if (!currentLevel.has(segment)) {
                currentLevel.set(segment, {
                    value: isLeaf ? choice : null,
                    children: new Map(),
                })
            }

            const node = currentLevel.get(segment)!
            if (isLeaf) {
                node.value = choice
            }
            currentLevel = node.children
        })
    })

    return root
}

/**
 * Converts a tree key to a display label
 * Handles boolean string conversion
 */
function getOptionLabel(key: string): string {
    if (key === 'boolean.true') return 'Yes'
    if (key === 'boolean.false') return 'No'
    return key
}

/**
 * Converts a tree level to options for Select component
 */
function treeToOptions(
    tree: Map<string, TreeNode>,
    currentPath: string[] = [],
): TreeOption[] {
    return Array.from(tree, ([key, node]) => {
        const fullPath = [...currentPath, key]
        return {
            type: OptionEnum.Option,
            id: key,
            label: getOptionLabel(key),
            value: node.value ?? fullPath.join(NESTING_DELIMITER),
            path: fullPath,
            hasChildren: node.children.size > 0,
        }
    })
}

/**
 * Navigates to a specific path in the tree
 */
function navigateToPath(
    tree: Map<string, TreeNode>,
    path: string[],
): Map<string, TreeNode> {
    let currentLevel = tree

    for (const segment of path) {
        const node = currentLevel.get(segment)
        if (!node) return tree
        currentLevel = node.children
    }

    return currentLevel
}

/**
 * Gets options at a specific path in the tree
 */
export function getOptionsAtPath(
    tree: Map<string, TreeNode>,
    currentPath: string[],
): TreeOption[] {
    const currentLevelTree = navigateToPath(tree, currentPath)
    const options = treeToOptions(currentLevelTree, currentPath)

    // Root and leaf levels do not need a parent value inserted.
    if (currentPath.length === 0 || options.length === 0) {
        return options
    }

    // Look up the node represented by the current path, not its children.
    const currentKey = currentPath[currentPath.length - 1]
    const currentValue = navigateToPath(tree, currentPath.slice(0, -1)).get(
        currentKey,
    )?.value

    // Some parent nodes are only navigation groups; selectable parents have a value.
    if (currentValue === null || currentValue === undefined) {
        return options
    }

    // Show the selectable parent before its children without making it navigable.
    return [
        {
            type: OptionEnum.Option,
            id: String(currentValue),
            label: getOptionLabel(currentKey),
            value: currentValue,
            path: currentPath,
            hasChildren: false,
        },
        ...options,
    ]
}

/**
 * Flattens the entire tree into a list of leaf options with parent path captions
 * Caption format: "Parent" or "Parent > Child" for nested levels
 */
function flattenTreeWithCaptionsRecursively(
    tree: Map<string, TreeNode>,
    parentPath: string[] = [],
): TreeOption[] {
    return Array.from(tree).reduce<TreeOption[]>((acc, [key, node]) => {
        const currentPath = [...parentPath, key]

        if (node.value !== null) {
            const caption =
                parentPath.length > 0 ? parentPath.join(' > ') : undefined
            acc.push({
                type: OptionEnum.Option,
                id: String(node.value),
                label: key,
                value: node.value,
                path: currentPath,
                hasChildren: false,
                caption,
            })
        }

        if (node.children.size > 0) {
            acc.push(
                ...flattenTreeWithCaptionsRecursively(
                    node.children,
                    currentPath,
                ),
            )
        }

        return acc
    }, [])
}

export function flattenTreeWithCaptions(
    tree: Map<string, TreeNode>,
): TreeOption[] {
    return flattenTreeWithCaptionsRecursively(tree)
}

/**
 * Resolves the initial navigation path for a selected value.
 * Nested values reopen at their parent path, including the case where the
 * parent itself is also a selectable value in that level.
 */
export function getInitialPathFromValue(
    tree: Map<string, TreeNode>,
    value: TreeValue | undefined,
): string[] {
    const path = getPathFromValue(value)

    if (path.length > 0 || typeof value !== 'string') {
        return path
    }

    const node = tree.get(value)
    return node?.children.size ? [value] : path
}

/**
 * Extracts the current tree path from a full value
 * "Order::Missing" -> ["Order"]
 * For boolean dropdowns, returns empty array (no path)
 */
function getPathFromValue(value: TreeValue | undefined): string[] {
    if (!value) return []
    if (typeof value !== 'string') return []

    const parts = value.split(NESTING_DELIMITER)
    return parts.slice(0, -1)
}

/**
 * Extracts the display label from a hierarchical value
 * Returning the last segment (e.g., "Order::Missing" → "Missing")
 * For boolean values, returns "Yes" or "No"
 */
export function getDisplayLabel(
    value: TreeValue | undefined,
    fullValue?: true,
): string | null {
    if (value === null || value === undefined) return null
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value !== 'string') return String(value)

    const parts = value.split(NESTING_DELIMITER)
    return fullValue ? parts.join(' > ') : parts[parts.length - 1]
}
