import React, {useCallback} from 'react'
import {Input} from 'reactstrap'

import EmojiSelect from '../../components/ViewTable/EmojiSelect/EmojiSelect'

import css from './EmojiTextInput.less'

type Props = {
    id: string
    emoji: string | null
    value: string
    placeholder: string
    required?: boolean
    onEmojiChange: (emoji: string | null) => void
    onChange: (value: string) => void
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
    onEmojiChange,
    onChange,
}: Props): JSX.Element {
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
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value)
        },
        [onChange]
    )

    return (
        <div className={css.container}>
            <EmojiSelect
                className={css.emojiPicker}
                emoji={emoji}
                onEmojiSelect={onEmojiSelect}
                onEmojiClear={onEmojiClear}
            />
            <Input
                type="text"
                id={id}
                tabIndex={0}
                className={css.input}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={onInputChange}
            />
        </div>
    )
}
