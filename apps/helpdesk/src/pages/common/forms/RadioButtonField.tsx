import type { ComponentProps } from 'react'
import React from 'react'

import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

type RadioFieldSetProps = ComponentProps<typeof RadioFieldSet>

type RadioButtonFieldProps = {
    value: RadioFieldSetProps['selectedValue']
} & Omit<RadioFieldSetProps, 'selectedValue'>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<RadioGroup />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export default function RadioButtonField({
    value,
    ...radioFieldSetProps
}: RadioButtonFieldProps) {
    return <RadioFieldSet {...radioFieldSetProps} selectedValue={value} />
}
