import classnames from 'classnames'
import React, {
    ComponentProps,
    FocusEvent,
    KeyboardEvent,
    ForwardedRef,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react'

import useEffectOnce from 'hooks/useEffectOnce'
import TextInput from 'pages/common/forms/input/TextInput'

import css from './EditableTitle.less'

type Props = {
    className?: string
    inputClassName?: string
    title: string
    placeholder?: string
    update: (value: string) => void
    focus?: boolean
    select?: boolean
    disabled?: boolean
    forceEditMode?: boolean
    onChange?: (value?: string) => void
} & ComponentProps<typeof TextInput>

const EditableTitle = (
    {
        className,
        inputClassName,
        title,
        placeholder,
        update,
        focus,
        select,
        disabled,
        forceEditMode,
        onChange,
        isRequired,
        ...props
    }: Props,
    ref: ForwardedRef<HTMLInputElement>
) => {
    const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
        null
    )
    useImperativeHandle(ref, () => inputElement!)

    const [value, setValue] = useState(title)
    const [editMode, setEditMode] = useState(false)

    useEffectOnce(() => {
        setTimeout(() => {
            if (select) {
                handleSelect()
            }
        }, 1)
    })

    useEffect(() => {
        if (value !== title) {
            setValue(title)

            setTimeout(() => {
                if (select) {
                    handleSelect()
                } else {
                    blur()
                }
            }, 1)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title])

    const handleSelect = () => inputElement?.select()

    const blur = () => inputElement?.blur()

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
        }
    }

    const onKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault()

            setEditMode(false)

            if (e.key === 'Enter') {
                blur()
            }
        }
    }

    const handleOnChange = (value: string) => {
        setValue(value)
        onChange?.(value)
    }

    const onBlur = ({target: {value}}: FocusEvent<HTMLInputElement>) => {
        setEditMode(false)
        update(value)
    }

    return (
        <TextInput
            className={classnames(className, css.component, {
                [css['edit-mode']]: editMode || forceEditMode,
                [css.isDisabled]: disabled,
            })}
            ref={setInputElement}
            tabIndex={1}
            isDisabled={disabled}
            inputClassName={classnames(inputClassName, css.input, {
                [css['edit-mode']]: editMode || forceEditMode,
            })}
            placeholder={placeholder}
            autoFocus={focus}
            value={value}
            onChange={handleOnChange}
            onBlur={onBlur}
            onKeyUp={onKeyUp}
            onKeyDown={onKeyDown}
            hasError={isRequired && !value.trim().length}
            {...props}
        />
    )
}

export default forwardRef<HTMLInputElement, Props>(EditableTitle)
