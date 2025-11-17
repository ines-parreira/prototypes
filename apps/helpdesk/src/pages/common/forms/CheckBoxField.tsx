import type { ComponentProps, ForwardedRef } from 'react'
import React, { forwardRef } from 'react'

import CheckBox from './CheckBox'

type Props = {
    value: boolean
    label?: string
} & Omit<ComponentProps<typeof CheckBox>, 'value'>

function CheckBoxField(
    { value, label, ...props }: Props,
    ref: ForwardedRef<HTMLInputElement>,
) {
    return (
        <CheckBox {...props} ref={ref} isChecked={value}>
            {label}
        </CheckBox>
    )
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<CheckboxField />` from @gorgias/axiom instead.
 * @date 2025-04-01
 * @type ui-kit-migration
 */
export default forwardRef(CheckBoxField)
