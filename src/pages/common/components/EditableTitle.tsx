import React, {
    ComponentProps,
    FocusEvent,
    KeyboardEvent,
    useEffect,
    useRef,
    useState,
} from 'react'
import classnames from 'classnames'
import {useEffectOnce} from 'react-use'

import TextInput from 'pages/common/forms/input/TextInput'
import css from './EditableTitle.less'

type Props = {
    className: string
    title: string
    placeholder?: string
    update: (value: string) => void
    focus?: boolean
    select?: boolean
    disabled?: boolean
    forceEditMode?: boolean
    onChange?: (value?: string) => void
} & ComponentProps<typeof TextInput>

const EditableTitle = ({
    className,
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
}: Props) => {
    const ref = useRef<HTMLInputElement>(null)

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

    const handleSelect = () => ref?.current?.select()

    const blur = () => ref?.current?.blur()

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
            className={classnames(css.component, {
                [css['edit-mode']]: editMode || forceEditMode,
                [css.isDisabled]: disabled,
            })}
            ref={ref}
            tabIndex={1}
            isDisabled={disabled}
            inputClassName={classnames(className, css.input, {
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

export default EditableTitle
