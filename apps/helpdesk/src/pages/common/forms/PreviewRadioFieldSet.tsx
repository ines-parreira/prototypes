import React, { ReactChild, ReactNode } from 'react'

import { useId } from '@repo/hooks'
import classnames from 'classnames'

import { PreviewRadioButton } from '../components/PreviewRadioButton'

import css from './PreviewRadioFieldSet.less'

export type RadioFieldOption = {
    value: string
    label: ReactNode
    caption?: string | ReactNode
    disabled?: boolean
    preview?: ReactChild
}

type Props = {
    className?: string
    isDisabled?: boolean
    name?: string
    onChange: (value: string) => void
    options: Array<RadioFieldOption>
    value: string | null
}

const PreviewRadioFieldSet = ({
    className,
    isDisabled = false,
    name,
    onChange,
    options,
    value: selectedValue,
}: Props) => {
    const id = useId()
    const fieldsetName = name || 'radio-field-' + id

    return (
        <fieldset
            disabled={isDisabled}
            name={fieldsetName}
            className={classnames(css.container, className)}
        >
            {options.map(({ value, label, caption, disabled, preview }) => (
                <PreviewRadioButton
                    key={value}
                    name={fieldsetName}
                    value={value}
                    label={label}
                    caption={caption}
                    isSelected={selectedValue === value}
                    isDisabled={disabled || isDisabled}
                    onClick={() => onChange(value)}
                    preview={preview}
                />
            ))}
        </fieldset>
    )
}

export default PreviewRadioFieldSet
