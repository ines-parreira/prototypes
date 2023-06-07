import React from 'react'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import WhatsAppMessageTemplateMessageBody from './WhatsAppMessageTemplateMessageBody'
import {processWhatsAppMarkdown} from './utils'

import css from './WhatsAppMessageTemplateMessage.less'

type Props = {
    template: WhatsAppMessageTemplate
    isPreview?: boolean
}

export default function WhatsAppMessageTemplateMessage({
    template,
    isPreview = true,
}: Props) {
    const footer = template.components.footer.value

    return (
        <div data-testid="template-message">
            <WhatsAppMessageTemplateMessageBody
                isPreview={isPreview}
                message={processWhatsAppMarkdown(
                    template.components.body.value
                )}
            />
            {footer && <div className={css.footer}>{footer}</div>}
        </div>
    )
}
