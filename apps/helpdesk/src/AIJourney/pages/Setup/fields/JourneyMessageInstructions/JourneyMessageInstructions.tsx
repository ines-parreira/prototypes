import { useCallback } from 'react'

import classNames from 'classnames'

import { FieldPresentation, Info } from 'AIJourney/components'
import TextArea from 'pages/common/forms/TextArea'

import css from './JourneyMessageInstructions.less'

type JourneyMessageInstructionsFieldProps = {
    value?: string
    onChange?: (value: string) => void
    maxLength?: number
}

export const JourneyMessageInstructionsField = ({
    value = '',
    onChange,
    maxLength = 2000,
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
                name="AI message instructions"
                description="Provide instructions for the AI agent's messaging tone and style (optional)"
            />
            <div className={css.textareaContainer}>
                <TextArea
                    autoRowHeight={true}
                    placeholder="Enter instructions for how the AI should communicate with customers..."
                    maxLength={maxLength}
                    value={value}
                    onChange={handleChange}
                    style={{ minHeight: '80px' }}
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
            <Info content="Guide the AI agent's communication style during cart abandonment campaigns. Examples: 'Use a friendly and conversational tone', 'Speak casually, use emojis 🛍️', 'Be professional and concise'." />
        </div>
    )
}
