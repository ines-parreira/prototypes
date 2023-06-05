import React from 'react'
import {WhatsAppTemplate} from 'models/integration/types'
import WhatsAppTemplateMessageBody from './WhatsAppTemplateMessageBody'
import {processWhatsAppMarkdown} from './utils'

import css from './WhatsAppTemplateMessage.less'

type Props = {
    template: WhatsAppTemplate
    isPreview?: boolean
}

export default function WhatsAppTemplateMessage({
    template,
    isPreview = true,
}: Props) {
    const footer = template.components.footer.value

    return (
        <div data-testid="template-message">
            <WhatsAppTemplateMessageBody
                isPreview={isPreview}
                message={processWhatsAppMarkdown(
                    template.components.body.value
                )}
            />
            {footer && <div className={css.footer}>{footer}</div>}
        </div>
    )
}
