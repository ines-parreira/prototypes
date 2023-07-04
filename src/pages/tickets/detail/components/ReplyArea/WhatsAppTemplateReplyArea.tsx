import React from 'react'
import {useEffectOnce} from 'react-use'
import WhatsAppMessageTemplateMessage from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateMessage'
import {WhatsAppMessageTemplateStatus} from 'models/whatsAppMessageTemplates/types'
import {useListWhatsAppMessageTemplates} from 'models/whatsAppMessageTemplates/queries'
import {makeGetNewMessageSourceProperty} from 'state/newMessage/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {getNewPhoneNumberByNumber} from 'state/entities/phoneNumbers/selectors'
import {SourceAddress} from 'models/ticket/types'
import {useWhatsAppEditor} from 'pages/integrations/integration/components/whatsapp/WhatsAppEditorContext'
import WhatsAppMessageTemplateSearch from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateSearch'
import WhatsAppMessageTemplateNavigator from './WhatsAppMessageTemplateNavigator'

import css from './WhatsAppTemplateReplyArea.less'

export default function WhatsAppMessageTemplateReplyArea() {
    const {
        isTemplateListVisible,
        selectNewTemplate,
        selectedTemplate,
        searchFilter,
        cleanupEditorState,
    } = useWhatsAppEditor()

    const fromPhoneNumber = useAppSelector(makeGetNewMessageSourceProperty)(
        'from'
    )?.toJS?.() as SourceAddress
    const phoneNumber = useAppSelector(
        getNewPhoneNumberByNumber(fromPhoneNumber?.address)
    )

    const {data, isLoading} = useListWhatsAppMessageTemplates({
        is_supported: true,
        waba_id: phoneNumber?.whatsapp_phone_number?.waba_id,
        status: WhatsAppMessageTemplateStatus.Approved,
        search: searchFilter.name,
    })

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
            {isTemplateListVisible && (
                <WhatsAppMessageTemplateNavigator
                    onItemClick={selectNewTemplate}
                    templates={data?.data || []}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}
