import {EditorState} from 'draft-js'
import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {TicketChannel} from 'business/types/ticket'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import {TemplateTypeFilterOption} from 'pages/tickets/detail/components/ReplyArea/types'
import {setNewMessageActions, setResponseText} from 'state/newMessage/actions'
import {
    getNewMessageActions,
    getNewMessageExternalTemplateAction,
    isNewMessagePublic,
    getNewMessageChannel,
} from 'state/newMessage/selectors'
import {clearAppliedMacro} from 'state/ticket/actions'
import {getCustomerMessages, getTicket} from 'state/ticket/selectors'
import {mergeActionsJS} from 'state/ticket/utils'

import {
    createApplyExternalTemplateAction,
    isWhatsAppWindowOpen as checkIsWhatsAppWindowOpen,
} from './utils'
import {Context} from './WhatsAppEditorContext'
import {WhatsAppMessageTemplateSearchFilters} from './WhatsAppMessageTemplateSearch'

export default function WhatsAppEditorProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [searchFilter, setSearchFilter] =
        useState<WhatsAppMessageTemplateSearchFilters>({
            language: [],
            name: '',
        })

    const ticket = useAppSelector(getTicket)
    const [isTemplateListVisible, setIsTemplateListVisible] = useState(true)
    const [selectedTemplateType, setSelectedTemplateType] =
        useState<TemplateTypeFilterOption>(TemplateTypeFilterOption.Templates)

    const channel = useAppSelector(getNewMessageChannel)
    const isPublicNewMessage = useAppSelector(isNewMessagePublic)

    const whatsAppMessageTemplatesEnabled =
        useFlags()[FeatureFlagKey.WhatsAppMessageTemplates]

    const customerMessagesList = useAppSelector(getCustomerMessages)
    const currentActions = useAppSelector(getNewMessageActions)
    const externalTemplateAction = useAppSelector(
        getNewMessageExternalTemplateAction
    )
    const selectedTemplate = externalTemplateAction?.arguments?.template

    const isWhatsAppWindowOpen = useMemo(
        () => checkIsWhatsAppWindowOpen(customerMessagesList.toJS()),
        [customerMessagesList]
    )

    const dispatch = useAppDispatch()

    const cleanupEditorState = useCallback(() => {
        const editorState = EditorState.createEmpty()
        dispatch(
            setResponseText(
                fromJS({
                    contentState: editorState.getCurrentContent(),
                    selectionState: editorState.getSelection(),
                })
            )
        )
        dispatch(clearAppliedMacro(ticket.id ?? 'new'))
        dispatch(setNewMessageActions())
    }, [dispatch, ticket.id])

    useEffect(() => {
        if (!selectedTemplate) {
            setIsTemplateListVisible(true)
        }
    }, [selectedTemplate])

    useEffect(() => {
        if (isWhatsAppWindowOpen && !selectedTemplate) {
            setSelectedTemplateType(TemplateTypeFilterOption.Macros)
        }
    }, [selectedTemplate, isWhatsAppWindowOpen])

    const selectNewTemplate = (template: WhatsAppMessageTemplate) => {
        cleanupEditorState()

        const newActions = mergeActionsJS(currentActions, [
            createApplyExternalTemplateAction(template),
        ])

        dispatch(setNewMessageActions(newActions))
        setIsTemplateListVisible(false)
    }

    const showWhatsAppTemplateEditor =
        whatsAppMessageTemplatesEnabled &&
        channel === TicketChannel.WhatsApp &&
        isPublicNewMessage &&
        selectedTemplateType === TemplateTypeFilterOption.Templates

    return (
        <Context.Provider
            value={{
                selectedTemplateType,
                setSelectedTemplateType,
                showWhatsAppTemplateEditor,
                whatsAppMessageTemplatesEnabled,
                isTemplateListVisible,
                setIsTemplateListVisible,
                selectNewTemplate,
                selectedTemplate,
                searchFilter,
                setSearchFilter,
                cleanupEditorState,
                isWhatsAppWindowOpen,
            }}
        >
            {children}
        </Context.Provider>
    )
}
