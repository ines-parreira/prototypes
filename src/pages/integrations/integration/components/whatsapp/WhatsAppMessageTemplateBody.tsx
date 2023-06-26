import React from 'react'
import {sanitizeHtmlDefault} from 'utils/html'
import InputField from 'pages/common/forms/input/InputField'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import WhatsAppVariablePreview from './WhatsAppVariablePreview'

import {whatsAppMessageTemplateToHtml, WHATSAPP_VARIABLE_REGEX} from './utils'

import css from './WhatsAppMessageTemplateMessage.less'

type Props = {
    template: WhatsAppMessageTemplate
    isPreview?: boolean
    value?: string[]
    onChange?: (value: string[]) => void
}

export default function WhatsAppMessageTemplateBody({
    template,
    isPreview,
    value = [],
    onChange,
}: Props) {
    const lines = template.components.body.value.split('\n')

    return (
        <div className={css.messageBody}>
            {lines.map((rawSentence, sentenceIndex) => {
                const sentence = whatsAppMessageTemplateToHtml(rawSentence)
                return (
                    <div key={sentenceIndex}>
                        <div className={css.sentence}>
                            {sentence
                                .split(WHATSAPP_VARIABLE_REGEX)
                                .map((part, partIndex) => {
                                    if (WHATSAPP_VARIABLE_REGEX.test(part)) {
                                        const variableKey = parseInt(
                                            part.slice(2, -2)
                                        )
                                        return (
                                            <div
                                                key={`${sentenceIndex}-${partIndex}`}
                                                className={css.variable}
                                                data-testid={`wa-variable-${
                                                    isPreview
                                                        ? 'preview'
                                                        : 'input'
                                                }`}
                                            >
                                                {isPreview ? (
                                                    <WhatsAppVariablePreview />
                                                ) : (
                                                    <InputField
                                                        name={`variable-${variableKey}`}
                                                        className={css.input}
                                                        value={
                                                            value[
                                                                variableKey - 1
                                                            ] ?? ''
                                                        }
                                                        onChange={(
                                                            inputValue
                                                        ) => {
                                                            const newValue = [
                                                                ...value,
                                                            ]
                                                            newValue[
                                                                variableKey - 1
                                                            ] = inputValue
                                                            onChange?.(newValue)
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        )
                                    }
                                    return (
                                        <div
                                            key={`${sentenceIndex}-${partIndex}`}
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeHtmlDefault(
                                                    part
                                                ),
                                            }}
                                        />
                                    )
                                })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
