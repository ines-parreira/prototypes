import React, {ComponentProps} from 'react'

import ToggleInput from 'pages/common/forms/ToggleInput'

type ToggleInputFieldProps = {
    value: boolean
    onChange: (nextValue: boolean) => void
} & Omit<
    ComponentProps<typeof ToggleInput>,
    'onChange' | 'value' | 'isToggled' | 'onClick'
>

export default function ToggleInputField({
    value,
    onChange,
    ...toggleInputProps
}: ToggleInputFieldProps) {
    return (
        <ToggleInput
            {...toggleInputProps}
            isToggled={value}
            onClick={onChange}
        />
    )
}
