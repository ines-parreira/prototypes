import React from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useEffectOnce} from 'react-use'
import WhatsAppMessageTemplateMessage from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateMessage'
import useWhatsAppEditor from 'pages/integrations/integration/components/whatsapp/useWhatsAppEditor'
import WhatsAppMessageTemplateSearch from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateSearch'
import WhatsAppMessageTemplateNavigator from './WhatsAppMessageTemplateNavigator'

import css from './WhatsAppTemplateReplyArea.less'

export default function WhatsAppMessageTemplateReplyArea() {
    const {isTemplateListVisible, selectedTemplate, cleanupEditorState} =
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
