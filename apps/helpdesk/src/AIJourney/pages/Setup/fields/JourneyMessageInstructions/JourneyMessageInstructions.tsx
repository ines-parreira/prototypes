import { useCallback } from 'react'

import classNames from 'classnames'

import { FieldPresentation, Info } from 'AIJourney/components'
import TextArea from 'pages/common/forms/TextArea'

import css from './JourneyMessageInstructions.less'

type JourneyMessageInstructionsFieldProps = {
    description?: string
    hideInfoContent?: boolean
    maxLength?: number
    name?: string
    onChange?: (value: string) => void
    optional?: boolean
    value?: string
}

export const JourneyMessageInstructionsField = ({
    description,
    hideInfoContent = false,
    maxLength = 2000,
    name,
    onChange,
    optional,
    value = '',
}: JourneyMessageInstructionsFieldProps) => {
    const handleChange = useCallback(
        (newValue: string) => {
            onChange?.(newValue)
        },
        [onChange],
    )

    const remainingCharacters = maxLength - value.length

    return (
        <div className={css.journeyMessageInstructionsField}>
            <FieldPresentation
                name={name ?? 'AI message instructions'}
                description={
                    description ??
                    "Provide instructions for the AI agent's messaging tone and style (optional)"
                }
                optional={optional}
            />
            <div className={css.textareaContainer}>
                <TextArea
                    autoRowHeight={true}
                    placeholder="Enter instructions for how the AI should communicate with customers..."
                    maxLength={maxLength}
                    value={value}
                    onChange={handleChange}
                    style={{ minHeight: '150px' }}
                />
                <div
                    className={classNames(css.characterCount, {
                        [css.characterCountWarning]: remainingCharacters < 100,
                    })}
                >
                    {remainingCharacters}{' '}
                    {remainingCharacters === 1 ? 'character' : 'characters'}{' '}
                    remaining
                </div>
            </div>
            {!hideInfoContent && (
                <Info content="Guide the AI agent's communication style during cart abandonment campaigns. Examples: 'Use a friendly and conversational tone', 'Speak casually, use emojis 🛍️', 'Be professional and concise'." />
            )}
        </div>
    )
}
