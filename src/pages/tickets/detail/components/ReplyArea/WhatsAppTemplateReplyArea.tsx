import React, {useState} from 'react'
import WhatsAppMessageTemplateMessage from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateMessage'
import useAppDispatch from 'hooks/useAppDispatch'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import {useListWhatsAppMessageTemplates} from 'models/whatsAppMessageTemplates/queries'
import {getNewMessageActions} from 'state/newMessage/selectors'
import {mergeActionsJS} from 'state/ticket/utils'
import useAppSelector from 'hooks/useAppSelector'
import {MacroActionName} from 'models/macroAction/types'
import {setNewMessageActions} from 'state/newMessage/actions'
import {countDistinctVariables} from 'pages/integrations/integration/components/whatsapp/utils'
import WhatsAppMessageTemplateNavigator from './WhatsAppMessageTemplateNavigator'

import css from './WhatsAppTemplateReplyArea.less'

export default function WhatsAppMessageTemplateReplyArea() {
    const [selectedTemplate, setSelectedTemplate] =
        useState<WhatsAppMessageTemplate>()
    const currentActions = useAppSelector(getNewMessageActions)

    const request = useListWhatsAppMessageTemplates()

    const dispatch = useAppDispatch()

    const handleTemplateClick = (template: WhatsAppMessageTemplate) => {
        const newActions = mergeActionsJS(currentActions, [
            {
                name: MacroActionName.ApplyExternalTemplate,
                type: 'system',
                title: 'Apply External Template',
                arguments: {
                    provider: 'whatsapp',
                    template_id: template.id,
                    body: Array(
                        countDistinctVariables(template.components.body.value)
                    ).fill({type: 'text', value: ''}),
                },
            },
        ])

        dispatch(setNewMessageActions(newActions))
        setSelectedTemplate(template)
    }

    return selectedTemplate ? (
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
    ) : (
        <WhatsAppMessageTemplateNavigator
            onItemClick={handleTemplateClick}
            templates={request.data?.data || []}
        />
    )
}
