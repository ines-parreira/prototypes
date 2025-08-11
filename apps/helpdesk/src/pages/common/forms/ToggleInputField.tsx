import React, { ComponentProps, forwardRef } from 'react'

import ToggleInput from 'pages/common/forms/ToggleInput'

type ToggleInputFieldProps = {
    value: boolean
    onChange: (nextValue: boolean) => void
} & Omit<
    ComponentProps<typeof ToggleInput>,
    'onChange' | 'value' | 'isToggled' | 'onClick'
>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<ToggleField />` from @gorgias/axiom instead.
 * @date 2025-03-25
 * @type ui-kit-migration
 */
const ToggleInputField = forwardRef<HTMLDivElement, ToggleInputFieldProps>(
    function ToggleInputField({ value, onChange, ...toggleInputProps }, __ref) {
        return (
            <ToggleInput
                {...toggleInputProps}
                isToggled={value}
                onClick={onChange}
            />
        )
    },
)

export default ToggleInputField
