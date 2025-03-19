import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    ApplyExternalTemplateActionArguments,
    WhatsAppMessageTemplate,
} from 'models/whatsAppMessageTemplates/types'
import { setNewMessageActions } from 'state/newMessage/actions'
import {
    getNewMessageActions,
    getNewMessageExternalTemplateAction,
} from 'state/newMessage/selectors'
import { mergeActionsJS } from 'state/ticket/utils'

import WhatsAppMessageTemplateBody from './WhatsAppMessageTemplateBody'
import WhatsAppMessageTemplateHeader from './WhatsAppMessageTemplateHeader'

import css from './WhatsAppMessageTemplateMessage.less'

type Props = {
    template: WhatsAppMessageTemplate
    isPreview?: boolean
}

export default function WhatsAppMessageTemplateMessage({
    template,
    isPreview = true,
}: Props) {
    const { footer, header } = template.components

    const dispatch = useAppDispatch()
    const newMessageActions = useAppSelector(getNewMessageActions)
    const externalTemplateAction = useAppSelector(
        getNewMessageExternalTemplateAction,
    )

    const externalTemplateActionArguments = externalTemplateAction?.arguments

    /* TODO create WhatsAppMessageTemplateEditor and WhatsAppTemplateMessagePreview */
    const handleTemplateValuesChange = (
        actionArguments: Partial<ApplyExternalTemplateActionArguments>,
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
            {header && (
                <WhatsAppMessageTemplateHeader
                    isPreview={isPreview}
                    template={template}
                    value={
                        externalTemplateActionArguments?.header?.map(
                            (argumentValue) => argumentValue.value,
                        ) ?? []
                    }
                    onChange={(value) => {
                        handleTemplateValuesChange({
                            ...externalTemplateActionArguments,
                            header: value.map((headerValue) => ({
                                type: 'text',
                                value: headerValue,
                            })),
                        })
                    }}
                />
            )}
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
                        (argumentValue) => argumentValue.value,
                    ) ?? []
                }
            />
            {footer && <div className={css.footer}>{footer.value}</div>}
        </div>
    )
}
