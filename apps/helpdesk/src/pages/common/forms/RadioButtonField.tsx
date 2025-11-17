import type { ComponentProps } from 'react'
import React from 'react'

import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

type RadioFieldSetProps = ComponentProps<typeof RadioFieldSet>

type RadioButtonFieldProps = {
    value: RadioFieldSetProps['selectedValue']
} & Omit<RadioFieldSetProps, 'selectedValue'>

export default function RadioButtonField({
    value,
    ...radioFieldSetProps
}: RadioButtonFieldProps) {
    return <RadioFieldSet {...radioFieldSetProps} selectedValue={value} />
}
