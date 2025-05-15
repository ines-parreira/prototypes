import {
    IconButton,
    SelectField,
    SelectFieldTriggerProps,
} from '@gorgias/merchant-ui-kit'

import { SORT_OPTIONS } from './constants'
import { SortOption } from './types'

const SelectTrigger = ({
    hasError: __hasError,
    isOpen: __isOpen,
    value: __value,
    setRef,
    ...buttonProps
}: SelectFieldTriggerProps) => (
    <IconButton
        {...buttonProps}
        ref={setRef}
        fillStyle="ghost"
        intent="secondary"
        isDisabled={buttonProps['disabled']}
        icon="swap_vert"
    />
)

type Props = {
    value: SortOption
    onChange: (value: SortOption) => void
}

export function Sort({ value, onChange }: Props) {
    return (
        <SelectField
            trigger={SelectTrigger}
            dropdownAlignment="end"
            dropdownMaxWidth={400}
            selectedOption={value}
            onChange={onChange}
            options={SORT_OPTIONS}
            optionMapper={(option) => ({
                icon:
                    option.order === 'asc' ? 'arrow_upward' : 'arrow_downward',
                value: option.label,
            })}
        />
    )
}
