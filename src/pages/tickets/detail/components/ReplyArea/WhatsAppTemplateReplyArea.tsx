import React, {useState} from 'react'
import WhatsAppMessageTemplateMessage from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateMessage'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    WhatsAppMessageTemplate,
    WhatsAppMessageTemplateStatus,
} from 'models/whatsAppMessageTemplates/types'
import {useListWhatsAppMessageTemplates} from 'models/whatsAppMessageTemplates/queries'
import {
    getNewMessageActions,
    getNewMessageExternalTemplateAction,
    makeGetNewMessageSourceProperty,
} from 'state/newMessage/selectors'
import {mergeActionsJS} from 'state/ticket/utils'
import useAppSelector from 'hooks/useAppSelector'
import {MacroActionName} from 'models/macroAction/types'
import {setNewMessageActions} from 'state/newMessage/actions'
import {
    countDistinctVariables,
    getTemplateLanguageOptions,
} from 'pages/integrations/integration/components/whatsapp/utils'
import {getNewPhoneNumberByNumber} from 'state/entities/phoneNumbers/selectors'
import {SourceAddress} from 'models/ticket/types'
import useDebouncedValue from 'hooks/useDebouncedValue'
import {useWhatsAppEditor} from 'pages/integrations/integration/components/whatsapp/WhatsAppEditorContext'
import WhatsAppMessageTemplateSearch, {
    WhatsAppMessageTemplateSearchFilters,
} from 'pages/integrations/integration/components/whatsapp/WhatsAppMessageTemplateSearch'
import WhatsAppMessageTemplateNavigator from './WhatsAppMessageTemplateNavigator'

import css from './WhatsAppTemplateReplyArea.less'

const SEARCH_DEBOUNCE_DELAY = 350

type Props = {
    isNewTicket: boolean
}

export default function WhatsAppMessageTemplateReplyArea({isNewTicket}: Props) {
    const [searchValue, setSearchValue] = useState<
        Pick<WhatsAppMessageTemplateSearchFilters, 'language' | 'name'>
    >({
        language: [],
        name: '',
    })

    const {isTemplateListCollapsed, setIsTemplateListCollapsed} =
        useWhatsAppEditor()

    const currentActions = useAppSelector(getNewMessageActions)
    const externalTemplateAction = useAppSelector(
        getNewMessageExternalTemplateAction
    )
    const selectedTemplate = externalTemplateAction?.arguments?.template

    const fromPhoneNumber = useAppSelector(makeGetNewMessageSourceProperty)(
        'from'
    )?.toJS?.() as SourceAddress
    const phoneNumber = useAppSelector(
        getNewPhoneNumberByNumber(fromPhoneNumber?.address)
    )

    const debouncedSearchValue = useDebouncedValue(
        searchValue,
        SEARCH_DEBOUNCE_DELAY
    )

    const {data, isLoading} = useListWhatsAppMessageTemplates({
        is_supported: true,
        waba_id: phoneNumber?.whatsapp_phone_number?.waba_id,
        status: WhatsAppMessageTemplateStatus.Approved,
        search: debouncedSearchValue.name,
    })
    const languageFilterOptions = getTemplateLanguageOptions(data?.data || [])

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
        setIsTemplateListCollapsed(true)
    }

    return (
        <div>
            <WhatsAppMessageTemplateSearch
                placeholder={
                    isNewTicket
                        ? 'Search WhatsApp templates by name'
                        : 'Search macros or WhatsApp templates by name'
                }
                displayTemplateTypeFilter={!isNewTicket}
                isCollapsible={!isNewTicket}
                isCollapsed={isTemplateListCollapsed}
                setIsCollapsed={setIsTemplateListCollapsed}
                languages={languageFilterOptions}
                value={searchValue}
                onChange={setSearchValue}
            />
            {selectedTemplate && isTemplateListCollapsed && (
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
            {!isTemplateListCollapsed && (
                <WhatsAppMessageTemplateNavigator
                    onItemClick={handleTemplateClick}
                    templates={data?.data || []}
                    isLoading={isLoading}
                />
            )}
        </div>
    )
}
