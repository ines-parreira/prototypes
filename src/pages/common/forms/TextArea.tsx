import React, {
    forwardRef,
    TextareaHTMLAttributes,
    ReactNode,
    Ref,
    useMemo,
} from 'react'
import _uniqueId from 'lodash/uniqueId'
import classnames from 'classnames'

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
} & Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'disabled' | 'onChange' | 'required'
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
        ...props
    }: Props,
    ref: Ref<HTMLTextAreaElement> | null | undefined
) {
    const textareaId = useMemo(() => id || _uniqueId('textarea-'), [id])
    const captionId = useMemo(() => `${textareaId}-caption`, [textareaId])

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
                onChange={(event) => onChange(event.target.value)}
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
