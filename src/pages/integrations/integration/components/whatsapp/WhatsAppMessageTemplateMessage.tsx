import React from 'react'
import {
    ApplyExternalTemplateActionArguments,
    WhatsAppMessageTemplate,
} from 'models/whatsAppMessageTemplates/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {setNewMessageActions} from 'state/newMessage/actions'
import useAppSelector from 'hooks/useAppSelector'
import {getNewMessageActions} from 'state/newMessage/selectors'
import {mergeActionsJS} from 'state/ticket/utils'
import {MacroActionName} from 'models/macroAction/types'
import WhatsAppMessageTemplateBody from './WhatsAppMessageTemplateBody'

import css from './WhatsAppMessageTemplateMessage.less'

type Props = {
    template: WhatsAppMessageTemplate
    isPreview?: boolean
}

export default function WhatsAppMessageTemplateMessage({
    template,
    isPreview = true,
}: Props) {
    const footer = template.components.footer?.value

    const dispatch = useAppDispatch()
    const newMessageActions = useAppSelector(getNewMessageActions)

    const externalTemplateAction = newMessageActions.find(
        (action) => action.name === MacroActionName.ApplyExternalTemplate
    )
    const externalTemplateActionArguments = externalTemplateAction?.arguments

    /* TODO create WhatsAppMessageTemplateEditor and WhatsAppTemplateMessagePreview */
    const handleTemplateValuesChange = (
        actionArguments: Omit<
            ApplyExternalTemplateActionArguments,
            'provider' | 'template_id'
        >
    ) => {
        const newActions = mergeActionsJS(newMessageActions, [
            {
                ...externalTemplateAction,
                arguments: {
                    provider: 'whatsapp',
                    template_id: template.id,
                    ...actionArguments,
                },
            },
        ])

        dispatch(setNewMessageActions(newActions))
    }

    return (
        <div data-testid="template-message" className={css.container}>
            <WhatsAppMessageTemplateBody
                template={template}
                isPreview={isPreview}
                onChange={(value) => {
                    handleTemplateValuesChange({
                        ...externalTemplateActionArguments,
                        body: value.map((bodyValue) => ({
                            type: 'text',
                            value: bodyValue,
                        })),
                    })
                }}
                value={
                    externalTemplateActionArguments?.body?.map(
                        (argumentValue) => argumentValue.value
                    ) ?? []
                }
            />
            {footer && <div className={css.footer}>{footer}</div>}
        </div>
    )
}
