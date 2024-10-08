import {DROPDOWN_NESTING_DELIMITER} from 'custom-fields/constants'
import {CustomFieldValue} from 'custom-fields/types'

import {CHOICE_VALUES_SYMBOL} from '../constants'
import {ChoicesTree} from '../types'

export function buildTreeOfChoices(choices: CustomFieldValue[]) {
    const tree: ChoicesTree = {[CHOICE_VALUES_SYMBOL]: new Set()}
    choices.forEach((choice) => {
        if (['boolean', 'number'].includes(typeof choice)) {
            tree[CHOICE_VALUES_SYMBOL].add(choice)
        }

        if (typeof choice === 'string') {
            recursivelyBuildTreeOfChoices(
                tree,
                choice.split(DROPDOWN_NESTING_DELIMITER)
            )
        }
    })
    return tree
}

function recursivelyBuildTreeOfChoices(
    currentBranch: ChoicesTree,
    values: string[]
) {
    const currentValue = values.shift()

    if (!currentValue) return

    if (values.length === 0) {
        currentBranch[CHOICE_VALUES_SYMBOL].add(currentValue)
        return
    }

    if (!currentBranch[currentValue]) {
        currentBranch[currentValue] = {
            [CHOICE_VALUES_SYMBOL]: new Set(),
        }
    }
    recursivelyBuildTreeOfChoices(currentBranch[currentValue], values)
}
