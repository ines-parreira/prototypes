import React from 'react'

import InputField from 'pages/common/forms/input/InputField'
import { sanitizeHtmlDefault } from 'utils/html'

import { WHATSAPP_VARIABLE_REGEX, whatsAppMessageTemplateToHtml } from './utils'
import WhatsAppVariablePreview from './WhatsAppVariablePreview'

import css from './WhatsAppMessageTemplateMessage.less'

type Props = {
    line?: string
    isPreview?: boolean
    value?: string[]
    onChange?: (value: string[]) => void
}

export default function WhatsAppMessageTemplateLine({
    line: rawLine,
    isPreview,
    value = [],
    onChange,
}: Props) {
    if (!rawLine) return null

    const line = whatsAppMessageTemplateToHtml(rawLine)

    return (
        <div className={css.line}>
            {line.split(WHATSAPP_VARIABLE_REGEX).map((part, partIndex) => {
                if (WHATSAPP_VARIABLE_REGEX.test(part)) {
                    const variableKey = parseInt(part.slice(2, -2))
                    return (
                        <div
                            key={partIndex}
                            className={css.variable}
                            data-testid={`wa-variable-${
                                isPreview ? 'preview' : 'input'
                            }`}
                        >
                            {isPreview ? (
                                <WhatsAppVariablePreview />
                            ) : (
                                <InputField
                                    name={`variable-${variableKey}`}
                                    className={css.input}
                                    value={value[variableKey - 1] ?? ''}
                                    onChange={(inputValue) => {
                                        const newValue = [...value]
                                        newValue[variableKey - 1] = inputValue
                                        onChange?.(newValue)
                                    }}
                                />
                            )}
                        </div>
                    )
                }
                return (
                    <div
                        key={partIndex}
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlDefault(part),
                        }}
                    />
                )
            })}
        </div>
    )
}
