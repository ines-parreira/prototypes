import React, {
    forwardRef,
    TextareaHTMLAttributes,
    ReactNode,
    Ref,
    useCallback,
    useLayoutEffect,
    useRef,
    useImperativeHandle,
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
    ref: Ref<HTMLTextAreaElement | null> | null
) {
    const randomId = useId()
    const textareaId = id || 'textarea-' + randomId
    const captionId = `${textareaId}-caption`
    const innerTextAreaRef = useRef<HTMLTextAreaElement>(null)

    useImperativeHandle(ref, () => innerTextAreaRef.current)

    useLayoutEffect(() => {
        if (autoRowHeight && !!innerTextAreaRef.current) {
            // Based on: https://stackoverflow.com/a/53426195
            innerTextAreaRef.current.style.height = 'inherit'
            innerTextAreaRef.current.style.height = `${innerTextAreaRef.current.scrollHeight}px`
        }
    }, [props.value, autoRowHeight])

    const onChangeHandler = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            return onChange(event.target.value)
        },
        [onChange]
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
                ref={innerTextAreaRef}
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
