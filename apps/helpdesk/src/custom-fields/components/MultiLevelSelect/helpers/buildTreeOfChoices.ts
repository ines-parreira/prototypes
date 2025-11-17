import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
import type { CustomFieldValue } from 'custom-fields/types'

import type { ChoicesTree } from '../types'

const leafKey = (key: string) => {
    return `${key}${DROPDOWN_NESTING_DELIMITER}leaf`
}

export const branchKey = (key: string) => {
    return `${key}${DROPDOWN_NESTING_DELIMITER}branch`
}

export const fromTreeKey = (key: string) => {
    return key.split('::').shift() ?? ''
}

export function buildTreeOfChoices(choices: CustomFieldValue[]) {
    const tree: ChoicesTree = new Map()
    choices.forEach((choice) => {
        if (['boolean', 'number'].includes(typeof choice)) {
            tree.set(leafKey(choice.toString()), {
                value: choice,
                children: new Map(),
            })
        }

        if (typeof choice === 'string') {
            addToTree(tree, choice.split(DROPDOWN_NESTING_DELIMITER))
        }
    })
    return tree
}

function addToTree(tree: ChoicesTree, path: string[]) {
    let pointer = tree
    for (let i = 0; i < path.length - 1; i++) {
        const key = branchKey(path[i])
        if (!pointer.get(key)) {
            pointer.set(key, { value: null, children: new Map() })
        }
        pointer = pointer.get(key)!.children
    }
    const value = path[path.length - 1]
    pointer.set(leafKey(value), { value, children: new Map() })
}
