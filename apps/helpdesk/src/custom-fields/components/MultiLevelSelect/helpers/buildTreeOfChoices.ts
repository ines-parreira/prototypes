import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
import { CustomFieldValue } from 'custom-fields/types'

import { ChoicesTree } from '../types'

export function buildTreeOfChoices(choices: CustomFieldValue[]) {
    const tree: ChoicesTree = new Map()
    choices.forEach((choice) => {
        if (['boolean', 'number'].includes(typeof choice)) {
            tree.set(choice.toString(), { value: choice, children: new Map() })
        }

        if (typeof choice === 'string') {
            addToTree(tree, choice.split(DROPDOWN_NESTING_DELIMITER))
        }
    })
    return tree
}

function addToTree(tree: ChoicesTree, path: string[]) {
    let pointer = tree
    for (const part of path) {
        if (!pointer.get(part)) {
            pointer.set(part, { value: part, children: new Map() })
        }
        pointer = pointer.get(part)!.children
    }
}
