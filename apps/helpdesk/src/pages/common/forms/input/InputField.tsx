import React, {
    ComponentProps,
    createContext,
    forwardRef,
    ReactNode,
} from 'react'

import { Label } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import Caption from 'pages/common/forms/Caption/Caption'

import TextInput from './TextInput'

import css from './InputField.less'

type Props = {
    caption?: ReactNode
    label?: ReactNode
    className?: string
    error?: string | ReactNode
} & ComponentProps<typeof TextInput>

type InputFieldContextState = {
    id?: string
}

export const InputFieldContext = createContext<InputFieldContextState>({})

export default forwardRef<HTMLInputElement, Props>(function InputField(
    {
        caption,
        id,
        label,
        className,
        error,
        isDisabled = false,
        isRequired = false,
        ...props
    }: Props,
    ref,
) {
    const randomId = useId()
    const inputId = id || 'input-text-' + randomId
    const captionId = `${inputId}-caption`

    return (
        <InputFieldContext.Provider value={{ id: inputId }}>
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
                    ref={ref}
                    isDisabled={isDisabled}
                    isRequired={isRequired}
                    hasError={!!error}
                    id={inputId}
                    {...(caption && { 'aria-describedby': captionId })}
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
})
