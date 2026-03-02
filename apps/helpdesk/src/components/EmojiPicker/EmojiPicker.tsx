import type { EmojiData } from 'emoji-mart'
import { Picker } from 'emoji-mart'

import { Icon, IconName } from '@gorgias/axiom'

import 'emoji-mart/css/emoji-mart.css'

import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'

import {
    autoUpdate,
    flip,
    FloatingFocusManager,
    FloatingPortal,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react'

import css from './EmojiPicker.less'

export type EmojiPickerProps = {
    label?: string
    value: string
    onChange: (value: string) => void
    onValidationChange?: (isValid: boolean) => void
    placeholder?: string
    isDisabled?: boolean
    isRequired?: boolean
    error?: string
    caption?: string
    'aria-label'?: string
    onError?: (isError: boolean) => void
}

const EMOJI_REGEX = /^[\p{Emoji}\s]*$/u

function isOnlyEmojis(text: string): boolean {
    if (!text) return true
    return EMOJI_REGEX.test(text)
}

export const EmojiPicker = ({
    label,
    value,
    onChange,
    onValidationChange,
    placeholder,
    isDisabled = false,
    isRequired = false,
    error,
    caption,
    'aria-label': ariaLabel,
    onError,
}: EmojiPickerProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [validationError, setValidationError] = useState<string>()

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'bottom-start',
        middleware: [offset(8), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    })

    useEffect(() => {
        if (validationError) {
            onError?.(true)
        } else {
            onError?.(false)
        }
    }, [validationError, onError])

    const click = useClick(context)
    const dismiss = useDismiss(context)
    const role = useRole(context)

    const { getReferenceProps, getFloatingProps } = useInteractions([
        click,
        dismiss,
        role,
    ])

    const validateInput = (text: string) => {
        const valid = isOnlyEmojis(text)
        const errorMessage = valid ? undefined : 'Only emojis are allowed'
        setValidationError(errorMessage)
        onValidationChange?.(valid)
        return valid
    }

    const handleEmojiSelect = (emoji: EmojiData) => {
        if ('native' in emoji) {
            const newValue = value + emoji.native
            onChange(newValue)
            validateInput(newValue)
            setIsOpen(false)
        }
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        onChange(newValue)
        validateInput(newValue)
    }

    const displayError = error || validationError

    return (
        <div className={css.wrapper}>
            {label && (
                <label className={css.label}>
                    {label}
                    {isRequired && <span className={css.required}>*</span>}
                </label>
            )}
            <div
                className={`${css.inputContainer} ${isFocused ? css.focused : ''} ${displayError ? css.error : ''} ${isDisabled ? css.disabled : ''}`}
            >
                <button
                    ref={refs.setReference}
                    type="button"
                    disabled={isDisabled}
                    className={css.emojiButton}
                    aria-label="Open emoji picker"
                    {...getReferenceProps()}
                >
                    <Icon name={IconName.EmojiSmile} size="sm" />
                </button>
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    disabled={isDisabled}
                    required={isRequired}
                    aria-label={ariaLabel}
                    aria-invalid={!!displayError}
                    className={css.input}
                />
            </div>
            {displayError && (
                <div className={css.errorMessage}>{displayError}</div>
            )}
            {!displayError && caption && (
                <div className={css.caption}>{caption}</div>
            )}

            {isOpen && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={false}>
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className={css.pickerContainer}
                            {...getFloatingProps()}
                        >
                            <Picker
                                onClick={handleEmojiSelect}
                                autoFocus
                                native
                                color="#0d87dd"
                                perLine={8}
                                sheetSize={16}
                                showPreview={false}
                                showSkinTones={false}
                            />
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </div>
    )
}
