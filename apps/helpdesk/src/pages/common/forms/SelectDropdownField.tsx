import { ComponentProps } from 'react'

import { SelectField, SelectFieldRawOption } from '@gorgias/axiom'

type Props<T extends SelectFieldRawOption> = ComponentProps<
    typeof SelectField<T>
> & {
    value: T
}

export default function SelectDropdownField<T extends SelectFieldRawOption>({
    ...props
}: Props<T>) {
    return <SelectField<T> {...props} selectedOption={props.value} />
}
