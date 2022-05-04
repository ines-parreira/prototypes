import React, {ComponentProps, createContext, ReactNode} from 'react'

import useId from 'hooks/useId'
import Caption from 'pages/common/forms/Caption/Caption'
import Label from 'pages/common/forms/Label/Label'

import TextInput from './TextInput'

import css from './InputField.less'

type Props = {
    caption?: ReactNode
    label?: ReactNode
    className?: string
    error?: string
} & ComponentProps<typeof TextInput>

type InputFieldContextState = {
    id?: string
}

export const InputFieldContext = createContext<InputFieldContextState>({})

const InputField = ({
    caption,
    id,
    label,
    className,
    error,
    isDisabled = false,
    isRequired = false,
    ...props
}: Props) => {
    const randomId = useId()
    const inputId = id || 'input-text-' + randomId
    const captionId = `${inputId}-caption`

    return (
        <InputFieldContext.Provider value={{id: inputId}}>
            <div className={className}>
                {!!label && (
                    <Label
                        className={css.label}
                        isDisabled={isDisabled}
                        isRequired={isRequired}
                        htmlFor={inputId}
                    >
                        {label}
                    </Label>
                )}
                <TextInput
                    isDisabled={isDisabled}
                    isRequired={isRequired}
                    hasError={!!error}
                    id={inputId}
                    {...(caption && {'aria-describedby': captionId})}
                    {...props}
                />
                {!!(caption || error) && (
                    <Caption id={captionId} error={error}>
                        {caption}
                    </Caption>
                )}
            </div>
        </InputFieldContext.Provider>
    )
}

export default InputField
