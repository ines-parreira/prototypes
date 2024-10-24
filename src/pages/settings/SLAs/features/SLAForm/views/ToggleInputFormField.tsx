import React, {ComponentProps, forwardRef} from 'react'

import ToggleInput from 'pages/common/forms/ToggleInput'

type ToggleInputFormFieldProps = {
    value: boolean
    onChange: (nextValue: boolean) => void
} & ComponentProps<typeof ToggleInput>

export default forwardRef(function ToggleInputFormField({
    value,
    onChange,
    ...toggleInputProps
}: ToggleInputFormFieldProps) {
    const handleOnClick = (nextValue: boolean) => {
        onChange(nextValue)
    }

    return (
        <ToggleInput
            {...toggleInputProps}
            isToggled={value}
            onClick={handleOnClick}
        />
    )
})
