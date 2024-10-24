import {Label} from '@gorgias/ui-kit'
import classnames from 'classnames'
import React, {
    ForwardedRef,
    forwardRef,
    TextareaHTMLAttributes,
    ReactNode,
    useCallback,
    useRef,
    useImperativeHandle,
    useEffect,
} from 'react'

import useId from 'hooks/useId'
import Caption from 'pages/common/forms/Caption/Caption'

import css from './TextArea.less'

type Props = {
    innerClassName?: string
    caption?: ReactNode
    error?: string
    isDisabled?: boolean
    isRequired?: boolean
    label?: ReactNode
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
        innerClassName,
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
    ref: ForwardedRef<HTMLTextAreaElement>
) {
    const randomId = useId()
    const textareaId = id || 'textarea-' + randomId
    const captionId = `${textareaId}-caption`
    const innerTextAreaRef = useRef<HTMLTextAreaElement>(null)

    useImperativeHandle(ref, () => innerTextAreaRef.current!)

    const adjustRowHeight = useCallback(() => {
        if (!innerTextAreaRef.current) {
            return
        }

        // Based on: https://stackoverflow.com/a/53426195
        innerTextAreaRef.current.style.height = 'inherit'

        const computed = window.getComputedStyle(innerTextAreaRef.current)
        const height =
            parseInt(computed.getPropertyValue('border-top-width'), 10) +
            innerTextAreaRef.current.scrollHeight +
            parseInt(computed.getPropertyValue('border-bottom-width'), 10)

        innerTextAreaRef.current.style.height = `${height}px`
    }, [])

    useEffect(() => {
        if (!autoRowHeight) {
            return
        }

        adjustRowHeight()

        window.addEventListener('resize', adjustRowHeight)

        return () => {
            window.removeEventListener('resize', adjustRowHeight)
        }
    }, [autoRowHeight, adjustRowHeight])

    const onChangeHandler = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (autoRowHeight) {
                adjustRowHeight()
            }
            return onChange(event.target.value)
        },
        [onChange, autoRowHeight, adjustRowHeight]
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
                className={classnames(
                    css.textarea,
                    {[css.error]: !!error},
                    innerClassName
                )}
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

export default forwardRef<HTMLTextAreaElement, Props>(TextArea)
