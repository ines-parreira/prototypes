import type { ComponentProps } from 'react'

import type { LegacySelectFieldRawOption as SelectFieldRawOption } from '@gorgias/axiom'
import { LegacySelectField as SelectField } from '@gorgias/axiom'

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
