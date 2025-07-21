import _find from 'lodash/find'

import { HIDDEN_VARIABLES, PREVIOUS_VARIABLES } from 'tickets/common/config'

import getVariablesList from './getVariablesList'

/**
 * Return variable config with passed value
 */
export default function getVariableWithValue(value: string) {
    const variables = getVariablesList()
    const hiddenVariables = getVariablesList(HIDDEN_VARIABLES)
    const previousVariables = getVariablesList(PREVIOUS_VARIABLES)

    return (
        _find(variables, { value }) ||
        _find(previousVariables, { value }) ||
        _find(hiddenVariables, { value })
    )
}
