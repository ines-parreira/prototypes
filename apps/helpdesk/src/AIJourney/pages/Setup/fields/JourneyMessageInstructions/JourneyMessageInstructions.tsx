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
    error?: string
    value?: string
}

export const JourneyMessageInstructionsField = ({
    description,
    hideInfoContent = false,
    error,
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
                name={name ?? 'Message guidance'}
                description={
                    description ??
                    'Write guidelines for how the AI should text your shoppers'
                }
                optional={optional}
            />
            <div className={css.textareaContainer}>
                <TextArea
                    autoRowHeight={true}
                    placeholder={`- Start with \"Hey!\"  \n- Don\'t include product descriptions\n- Be friendly`}
                    maxLength={maxLength}
                    value={value}
                    onChange={handleChange}
                    style={{ minHeight: '150px' }}
                    innerClassName={css.textArea}
                    error={error}
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
