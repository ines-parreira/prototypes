import React from 'react'

import useEffectOnce from 'hooks/useEffectOnce'
import useWhatsAppEditor from 'pages/integrations/integration/components/whatsapp/useWhatsAppEditor'
import WhatsAppMessageTemplateMessage from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateMessage'
import WhatsAppMessageTemplateSearch from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateSearch'

import WhatsAppMessageTemplateNavigator from './WhatsAppMessageTemplateNavigator'

import css from './WhatsAppTemplateReplyArea.less'

export default function WhatsAppMessageTemplateReplyArea() {
    const { isTemplateListVisible, selectedTemplate, cleanupEditorState } =
        useWhatsAppEditor()

    useEffectOnce(() => {
        cleanupEditorState()

        return () => {
            cleanupEditorState()
        }
    })

    return (
        <div>
            <WhatsAppMessageTemplateSearch />
            {selectedTemplate && !isTemplateListVisible && (
                <div
                    className={css.whatsAppTemplateEditor}
                    data-testid="template-editor"
                >
                    <div className={css.whatsAppTemplateContent}>
                        <WhatsAppMessageTemplateMessage
                            isPreview={false}
                            template={selectedTemplate}
                        />
                    </div>
                </div>
            )}
            {isTemplateListVisible && <WhatsAppMessageTemplateNavigator />}
        </div>
    )
}
