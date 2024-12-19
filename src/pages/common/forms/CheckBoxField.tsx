import React, {ComponentProps, ForwardedRef, forwardRef} from 'react'

import CheckBox from './CheckBox'

type Props = {
    value: boolean
    label?: string
} & Omit<ComponentProps<typeof CheckBox>, 'value'>

function CheckBoxField(
    {value, label, ...props}: Props,
    ref: ForwardedRef<HTMLInputElement>
) {
    return (
        <CheckBox {...props} ref={ref} isChecked={value}>
            {label}
        </CheckBox>
    )
}

export default forwardRef(CheckBoxField)
