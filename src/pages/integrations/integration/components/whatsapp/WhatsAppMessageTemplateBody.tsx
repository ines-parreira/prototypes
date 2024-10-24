import React from 'react'

import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'

import WhatsAppMessageTemplateLine from './WhatsAppMessageTemplateLine'

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
            {lines.map((rawLine, lineIndex) => (
                <WhatsAppMessageTemplateLine
                    key={lineIndex}
                    line={rawLine}
                    isPreview={isPreview}
                    value={value}
                    onChange={onChange}
                />
            ))}
        </div>
    )
}
