import React, {useMemo, ReactNode} from 'react'
import _uniqueId from 'lodash/uniqueId'

import RadioButton from '../components/RadioButton'

import css from './RadioFieldSet.less'

export type RadioFieldOption = {
    value: string
    label: ReactNode
    caption?: string
}

type Props = {
    className?: string
    isDisabled?: boolean
    label?: ReactNode
    name?: string
    onChange: (value: string) => void
    options: Array<RadioFieldOption>
    selectedValue: string | null
}

const RadioFieldSet = ({
    className,
    isDisabled = false,
    label,
    name,
    onChange,
    options,
    selectedValue,
}: Props) => {
    const fieldsetName = useMemo(
        () => name || _uniqueId('radio-field-'),
        [name]
    )

    return (
        <fieldset
            disabled={isDisabled}
            name={fieldsetName}
            className={className}
        >
            {!!label && <legend className={css.legend}>{label}</legend>}
            {options.map(({value, label, caption}) => (
                <RadioButton
                    key={value}
                    name={fieldsetName}
                    className={css.option}
                    value={value}
                    label={label}
                    caption={caption}
                    isSelected={selectedValue === value}
                    isDisabled={isDisabled}
                    onChange={onChange}
                />
            ))}
        </fieldset>
    )
}

export default RadioFieldSet
