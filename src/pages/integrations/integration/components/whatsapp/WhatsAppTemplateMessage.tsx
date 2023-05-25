import React from 'react'
import {WhatsAppTemplate} from 'models/integration/types'
import WhatsAppTemplateMessageBody from './WhatsAppTemplateMessageBody'

import {processWhatsAppMarkdown} from './utils'

type Props = {
    template: WhatsAppTemplate
    isPreview?: boolean
}

export default function WhatsAppTemplateMessage({
    template,
    isPreview = true,
}: Props) {
    return (
        <div data-testid="template-message">
            <WhatsAppTemplateMessageBody
                isPreview={isPreview}
                message={processWhatsAppMarkdown(
                    template.components.body.value
                )}
            />
        </div>
    )
}
