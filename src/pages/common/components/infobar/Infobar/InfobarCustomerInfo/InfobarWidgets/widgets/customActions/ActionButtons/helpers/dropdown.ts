import {produce} from 'immer'
import _get from 'lodash/get'

import {Option} from 'pages/common/forms/SelectField/types'

import {ACTION_PARAMETER_PATHS, DROPDOWN_VALUES_LIMIT} from '../../constants'
import {Action, Parameter, ParameterTypes} from '../../types'

export function splitDropdownValue(value?: string) {
    let values: string[] = []
    if (!value) {
        return values
    }
    const trimmedValue = value.trim()
    if (trimmedValue?.charAt(trimmedValue.length - 1) === ';') {
        values = trimmedValue?.split(';').slice(0, -1)
    } else {
        values = trimmedValue?.split(';')
    }
    return values
}

export function prepareDropdownValue(action: Action) {
    const updatedAction = produce(action, (draft) => {
        ACTION_PARAMETER_PATHS.forEach((path) => {
            ;(_get(draft, path) as Parameter[] | undefined)?.forEach(
                (param) => {
                    if (param.type === ParameterTypes.Dropdown) {
                        if (param.mandatory) {
                            param.value = splitDropdownValue(param.value)[0]
                        } else {
                            param.value = ''
                        }
                    }
                }
            )
        })
    })
    return updatedAction
}

export function getDropdownOptions(
    currentValue: string | undefined,
    initialValue: string | undefined,
    isNotRequired: boolean = true
) {
    const dropdownOptions: Option[] = splitDropdownValue(initialValue)
        .slice(0, DROPDOWN_VALUES_LIMIT)
        .map((dropdownValue) => ({
            value: dropdownValue,
            label: dropdownValue,
        }))
    if (isNotRequired && currentValue)
        dropdownOptions.unshift({
            label: ' - ',
            value: '',
        })

    return dropdownOptions
}
