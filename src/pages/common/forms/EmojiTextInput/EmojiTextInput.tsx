import React, {ReactNode, useCallback} from 'react'

import EmojiSelect from 'pages/common/components/ViewTable/EmojiSelect/EmojiSelect'
import Caption from 'pages/common/forms/Caption/Caption'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'

import css from './EmojiTextInput.less'

type Props = {
    id: string
    emoji: string | null
    value: string
    placeholder: string
    required?: boolean
    onEmojiChange: (emoji: string | null) => void
    onChange: (value: string) => void
    error?: string | ReactNode
}

/**
 * Text input, with an emoji picker next to it.
 */
export default function EmojiTextInput({
    id,
    emoji,
    value,
    placeholder,
    required = false,
    error,
    onEmojiChange,
    onChange,
}: Props): JSX.Element {
    const captionId = `${id}-caption`

    const onEmojiSelect = useCallback(
        (emoji: string) => {
            onEmojiChange(emoji)
        },
        [onEmojiChange]
    )

    const onEmojiClear = useCallback(() => {
        onEmojiChange(null)
    }, [onEmojiChange])

    const onInputChange = useCallback(
        (value) => {
            onChange(value)
        },
        [onChange]
    )

    return (
        <div className={css.container}>
            <InputGroup className={css.inputGroup}>
                <EmojiSelect
                    className={css.emojiPicker}
                    emoji={emoji}
                    onEmojiSelect={onEmojiSelect}
                    onEmojiClear={onEmojiClear}
                />
                <TextInput
                    id={id}
                    tabIndex={0}
                    placeholder={placeholder}
                    isRequired={required}
                    value={value}
                    onChange={onInputChange}
                    hasError={!!error}
                />
            </InputGroup>
            {!!error && (
                <Caption id={captionId} error={error}>
                    {error}
                </Caption>
            )}
        </div>
    )
}
