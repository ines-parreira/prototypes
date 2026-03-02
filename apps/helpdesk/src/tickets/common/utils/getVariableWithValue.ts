import _find from 'lodash/find'

import { HIDDEN_VARIABLES, PREVIOUS_VARIABLES } from 'tickets/common/config'
import type { Variable } from 'tickets/common/config'

import createMetafieldVariable from './createMetafieldVariable'
import getVariablesList from './getVariablesList'

export default function getVariableWithValue(
    value: string,
): Variable | undefined {
    const variables = getVariablesList()
    const hiddenVariables = getVariablesList(HIDDEN_VARIABLES)
    const previousVariables = getVariablesList(PREVIOUS_VARIABLES)

    return (
        _find(variables, { value }) ||
        _find(previousVariables, { value }) ||
        _find(hiddenVariables, { value }) ||
        createMetafieldVariable(value)
    )
}
