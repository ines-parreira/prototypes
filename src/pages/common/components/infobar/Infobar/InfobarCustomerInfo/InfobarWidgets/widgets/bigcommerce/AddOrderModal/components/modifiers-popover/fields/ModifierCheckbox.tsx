import React from 'react'

import {BigCommerceProductCheckboxModifier} from 'models/integration/types'

import CheckBox from 'pages/common/forms/CheckBox'
import sharedCss from './Shared.less'

type Props = {
    modifier: BigCommerceProductCheckboxModifier
    value: number | undefined
    onSetValue: (modifierId: number, optionId: number) => void
}

export const ModifierCheckbox = ({modifier, value, onSetValue}: Props) => {
    const findOptionIdByValue = (value: boolean) =>
        modifier.option_values.find(
            ({value_data: {checked_value}}) => checked_value === value
        )!.id

    const findValueByOptionId = (findId?: number) =>
        Boolean(
            modifier.option_values.find(({id}) => id === findId)?.value_data
                .checked_value
        )

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
        </div>
    )
}
