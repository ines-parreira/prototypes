import React, {useCallback} from 'react'

import EmojiSelect from 'pages/common/components/ViewTable/EmojiSelect/EmojiSelect'
import TextInput from 'pages/common/forms/input/TextInput'
import InputGroup from 'pages/common/forms/input/InputGroup'
import GroupItem from 'pages/common/components/layout/GroupItem'

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
        (value) => {
            onChange(value)
        },
        [onChange]
    )

    return (
        <div className={css.container}>
            <InputGroup className={css.inputGroup}>
                <GroupItem>
                    {() => (
                        <EmojiSelect
                            className={css.emojiPicker}
                            emoji={emoji}
                            onEmojiSelect={onEmojiSelect}
                            onEmojiClear={onEmojiClear}
                        />
                    )}
                </GroupItem>
                <TextInput
                    id={id}
                    tabIndex={0}
                    placeholder={placeholder}
                    isRequired={required}
                    value={value}
                    onChange={onInputChange}
                />
            </InputGroup>
        </div>
    )
}
