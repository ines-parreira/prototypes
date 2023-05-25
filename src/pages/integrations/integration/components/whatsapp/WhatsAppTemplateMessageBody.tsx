import React from 'react'
import {sanitizeHtmlDefault} from 'utils/html'
import {WHATSAPP_VARIABLE_REGEX} from './utils'
import WhatsAppVariablePreview from './WhatsAppVariablePreview'

import css from './WhatsAppTemplateMessage.less'

type Props = {
    message: string
    isPreview: boolean
}

export default function WhatsAppTemplateMessageBody({
    message,
    isPreview,
}: Props) {
    const sentences = message.split('\\n')

    return (
        <div className={css.messageBody}>
            {sentences.map((sentence, sentenceIndex) => (
                <div key={sentenceIndex}>
                    <div className={css.sentence}>
                        {sentence
                            .split(WHATSAPP_VARIABLE_REGEX)
                            .map((part, partIndex) => {
                                if (WHATSAPP_VARIABLE_REGEX.test(part)) {
                                    const key = part.slice(2, -2)
                                    return (
                                        <div key={key} className={css.variable}>
                                            {isPreview ? (
                                                <WhatsAppVariablePreview />
                                            ) : (
                                                'TODO'
                                            )}
                                        </div>
                                    )
                                }
                                return (
                                    <div
                                        key={`${sentenceIndex}-${partIndex}`}
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHtmlDefault(part),
                                        }}
                                    />
                                )
                            })}
                    </div>
                </div>
            ))}
        </div>
    )
}
