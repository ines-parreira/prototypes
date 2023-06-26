import React from 'react'
import WhatsAppMessageTemplateMessage from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateMessage'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    ApplyExternalTemplateAction,
    WhatsAppMessageTemplate,
    WhatsAppMessageTemplateStatus,
} from 'models/whatsAppMessageTemplates/types'
import {useListWhatsAppMessageTemplates} from 'models/whatsAppMessageTemplates/queries'
import {
    getNewMessageActions,
    makeGetNewMessageSourceProperty,
} from 'state/newMessage/selectors'
import {mergeActionsJS} from 'state/ticket/utils'
import useAppSelector from 'hooks/useAppSelector'
import {MacroActionName} from 'models/macroAction/types'
import {setNewMessageActions} from 'state/newMessage/actions'
import {countDistinctVariables} from 'pages/integrations/integration/components/whatsapp/utils'
import {getNewPhoneNumberByNumber} from 'state/entities/phoneNumbers/selectors'
import {SourceAddress} from 'models/ticket/types'
import WhatsAppMessageTemplateNavigator from './WhatsAppMessageTemplateNavigator'

import css from './WhatsAppTemplateReplyArea.less'

export default function WhatsAppMessageTemplateReplyArea() {
    const currentActions = useAppSelector(getNewMessageActions)
    const externalTemplateAction = (currentActions.find(
        (action) => action.name === MacroActionName.ApplyExternalTemplate
    ) || {}) as ApplyExternalTemplateAction
    const selectedTemplate = externalTemplateAction.arguments?.template
    const fromPhoneNumber = useAppSelector(makeGetNewMessageSourceProperty)(
        'from'
    )?.toJS?.() as SourceAddress

    const phoneNumber = useAppSelector(
        getNewPhoneNumberByNumber(fromPhoneNumber?.address)
    )

    const {data} = useListWhatsAppMessageTemplates({
        is_supported: true,
        waba_id: phoneNumber?.whatsapp_phone_number?.waba_id,
        status: WhatsAppMessageTemplateStatus.Approved,
    })

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
                    template: template,
                    body: Array(
                        countDistinctVariables(template.components.body.value)
                    ).fill({type: 'text', value: ''}),
                },
            },
        ])

        dispatch(setNewMessageActions(newActions))
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
            templates={data?.data || []}
        />
    )
}
