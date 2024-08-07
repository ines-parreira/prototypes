import React from 'react'
import classnames from 'classnames'

import {BigCommerceProductCheckboxModifier} from 'models/integration/types'
import CheckBox from 'pages/common/forms/CheckBox'

import {FieldProps} from './types'
import sharedCss from './Shared.less'

export const ModifierCheckbox = ({
    modifier,
    value,
    error,
    onSetValue,
}: FieldProps<BigCommerceProductCheckboxModifier>) => {
    const findOptionIdByValue = (value: boolean) =>
        modifier.option_values.find(
            ({value_data: {checked_value}}) => checked_value === value
        )!.id

    const findValueByOptionId = (findId?: number) =>
        Boolean(
            modifier.option_values.find(({id}) => id === findId)?.value_data
                .checked_value
        )

    const hasError = Boolean(error)

    return (
        <div className={sharedCss.inputContainer}>
            <CheckBox
                name={`${modifier.id}`}
                isChecked={findValueByOptionId(value)}
                isRequired={modifier.required}
                onChange={(value) =>
                    onSetValue(modifier.id, findOptionIdByValue(value))
                }
            >
                {modifier.display_name}
            </CheckBox>
            {hasError ? (
                <p className={classnames(sharedCss.error)}>{error}</p>
            ) : null}
        </div>
    )
}
