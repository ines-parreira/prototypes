import {Label} from '@gorgias/merchant-ui-kit'
import {Option} from '@gorgias/merchant-ui-kit/dist/SelectInput'
import React, {useRef} from 'react'

import CheckBox from 'pages/common/forms/CheckBox'
import NumberInput from 'pages/common/forms/input/NumberInput'
import TextInput from 'pages/common/forms/input/TextInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import {MerchantInput} from '../types'

import css from './ActionFormMerchantInputValue.less'

type Props = {
    input: MerchantInput
    value: string | number | boolean
    onChange: (input: string | number | boolean) => void
}

const ActionFormMerchantInputValue = ({input, onChange, value}: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const {name, description, data_type} = input
    const options = 'options' in input ? input.options : undefined
    return (
        <div ref={ref} className={css.container}>
            <Label isRequired>{name}</Label>
            {options && options.length ? (
                <SelectField
                    value={value as string}
                    options={options as Option[]}
                    onChange={onChange}
                    isSearchable={false}
                    fullWidth
                    showSelectedOption
                    showSelectedOptionIcon
                />
            ) : data_type === 'string' ? (
                <TextInput
                    value={value as string}
                    type={data_type}
                    placeholder={description}
                    onChange={onChange}
                />
            ) : data_type === 'boolean' ? (
                <CheckBox isChecked={value as boolean} onChange={onChange}>
                    {description}
                </CheckBox>
            ) : (
                <NumberInput
                    value={(value as number) || 0}
                    onChange={(nextValue) => {
                        onChange(nextValue ?? 0)
                    }}
                    placeholder={description}
                />
            )}
        </div>
    )
}

export default ActionFormMerchantInputValue
