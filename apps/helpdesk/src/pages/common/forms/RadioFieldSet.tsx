import type { ReactNode } from 'react'
import React from 'react'

import { useId } from '@repo/hooks'
import classnames from 'classnames'

import RadioButton from '../components/RadioButton'

import css from './RadioFieldSet.less'

export type RadioFieldOption = {
    value: string
    label: ReactNode
    caption?: string | ReactNode
    disabled?: boolean
}

type Props = {
    className?: string
    isDisabled?: boolean
    label?: ReactNode
    name?: string
    onChange: (value: string) => void
    options: Array<RadioFieldOption>
    selectedValue: string | null
    isHorizontal?: boolean
    dataCanduId?: string
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<RadioGroup />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const RadioFieldSet = ({
    className,
    isDisabled = false,
    label,
    name,
    onChange,
    options,
    selectedValue,
    isHorizontal,
    dataCanduId,
}: Props) => {
    const id = useId()
    const fieldsetName = name || 'radio-field-' + id

    return (
        <fieldset
            disabled={isDisabled}
            name={fieldsetName}
            className={classnames(className, {
                [css.horizontal]: isHorizontal,
            })}
            {...(dataCanduId ? { 'data-candu-id': dataCanduId } : {})}
        >
            {!!label && <legend className={css.legend}>{label}</legend>}
            {options.map(({ value, label, caption, disabled }) => (
                <RadioButton
                    key={value}
                    name={fieldsetName}
                    className={css.option}
                    value={value}
                    label={label}
                    caption={caption}
                    isSelected={selectedValue === value}
                    isDisabled={disabled || isDisabled}
                    onChange={onChange}
                    id={name ? `${name}-${value}` : undefined}
                />
            ))}
        </fieldset>
    )
}

export default RadioFieldSet
