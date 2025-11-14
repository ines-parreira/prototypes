import { NESTING_DELIMITER } from '../constants'
import {
    type BackButtonOption,
    type ClearButtonOption,
    type Option,
    OptionType,
    type TreeOption,
    type TreeValue,
} from '../types'

type TreeNode = {
    value: TreeValue | null
    children: Map<string, TreeNode>
}

/**
 * Builds a tree structure from an array of choice values
 * ("Level1::Level2")
 */
export function buildTreeFromChoices(
    choices: TreeValue[],
): Map<string, TreeNode> {
    const root = new Map<string, TreeNode>()

    choices.forEach((choice) => {
        const path = choice.split(NESTING_DELIMITER)
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
 * Converts a tree level to options for Select component
 */
function treeToOptions(
    tree: Map<string, TreeNode>,
    currentPath: string[] = [],
): TreeOption[] {
    return Array.from(tree, ([key, node]) => {
        const fullPath = [...currentPath, key]
        return {
            type: OptionType.Option,
            id: key,
            label: key,
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
    return treeToOptions(currentLevelTree, currentPath)
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
                type: OptionType.Option,
                id: node.value,
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
 * Extracts the current tree path from a full value
 * "Order::Missing" -> ["Order"]
 */
export function getPathFromValue(value: TreeValue | undefined): string[] {
    if (!value) return []

    const parts = value.split(NESTING_DELIMITER)
    return parts.slice(0, -1)
}

/**
 * Extracts the display label from a hierarchical value
 * Returning the last segment (e.g., "Order::Missing" → "Missing")
 */
export function getDisplayLabel(value: TreeValue | undefined): string | null {
    if (!value) return null

    const parts = value.split(NESTING_DELIMITER)
    return parts[parts.length - 1]
}

export function isBackButton(option: Option): option is BackButtonOption {
    return option.type === OptionType.Back
}

export function isClearButton(option: Option): option is ClearButtonOption {
    return option.type === OptionType.Clear
}
