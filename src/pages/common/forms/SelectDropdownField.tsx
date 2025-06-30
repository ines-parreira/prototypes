import { ComponentProps } from 'react'

import { SelectField, SelectFieldRawOption } from '@gorgias/merchant-ui-kit'

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
