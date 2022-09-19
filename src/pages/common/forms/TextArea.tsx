import React, {
    forwardRef,
    TextareaHTMLAttributes,
    ReactNode,
    Ref,
    useCallback,
} from 'react'
import classnames from 'classnames'

import useId from 'hooks/useId'
import Caption from 'pages/common/forms/Caption/Caption'
import Label from 'pages/common/forms/Label/Label'
import css from './TextArea.less'

type Props = {
    caption?: ReactNode
    error?: string
    isDisabled?: boolean
    isRequired?: boolean
    label?: string
    onChange: (nextValue: string) => void

    /**
     * Will automatically add or remove rows from the textarea as the user types.
     */
    autoRowHeight?: boolean
} & Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'disabled' | 'onChange' | 'required' | 'children'
>

function TextArea(
    {
        caption,
        className,
        error,
        isDisabled = false,
        isRequired = false,
        id,
        label,
        onChange,
        autoRowHeight,
        ...props
    }: Props,
    ref: Ref<HTMLTextAreaElement> | null | undefined
) {
    const randomId = useId()
    const textareaId = id || 'textarea-' + randomId
    const captionId = `${textareaId}-caption`

    const onChangeHandler = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (autoRowHeight) {
                // Based on: https://stackoverflow.com/a/53426195
                event.target.style.height = 'inherit'
                event.target.style.height = `${event.target.scrollHeight}px`
            }

            return onChange(event.target.value)
        },
        [onChange, autoRowHeight]
    )

    return (
        <div className={className}>
            {!!label && (
                <Label
                    className={css.label}
                    isDisabled={isDisabled}
                    isRequired={isRequired}
                    htmlFor={textareaId}
                >
                    {label}
                </Label>
            )}
            <textarea
                className={classnames(css.textarea, {[css.error]: !!error})}
                id={textareaId}
                name={textareaId}
                onChange={onChangeHandler}
                required={isRequired}
                disabled={isDisabled}
                {...(caption && {'aria-describedby': captionId})}
                ref={ref}
                {...props}
            />
            {!!(caption || error) && (
                <Caption id={captionId} error={error}>
                    {caption}
                </Caption>
            )}
        </div>
    )
}

export default forwardRef(TextArea)
