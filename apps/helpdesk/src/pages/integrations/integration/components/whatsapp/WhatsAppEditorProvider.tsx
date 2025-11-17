import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { EditorState } from 'draft-js'
import { fromJS } from 'immutable'

import { TicketChannel } from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { WhatsAppMessageTemplate } from 'models/whatsAppMessageTemplates/types'
import { TemplateTypeFilterOption } from 'pages/tickets/detail/components/ReplyArea/types'
import { setNewMessageActions, setResponseText } from 'state/newMessage/actions'
import {
    getNewMessageActions,
    getNewMessageChannel,
    getNewMessageExternalTemplateAction,
    isNewMessagePublic,
} from 'state/newMessage/selectors'
import { clearAppliedMacro } from 'state/ticket/actions'
import { getCustomerMessages, getTicket } from 'state/ticket/selectors'
import { mergeActionsJS } from 'state/ticket/utils'

import {
    isWhatsAppWindowOpen as checkIsWhatsAppWindowOpen,
    createApplyExternalTemplateAction,
} from './utils'
import { Context } from './WhatsAppEditorContext'
import type { WhatsAppMessageTemplateSearchFilters } from './WhatsAppMessageTemplateSearch'

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

    const customerMessagesList = useAppSelector(getCustomerMessages)
    const currentActions = useAppSelector(getNewMessageActions)
    const externalTemplateAction = useAppSelector(
        getNewMessageExternalTemplateAction,
    )
    const selectedTemplate = externalTemplateAction?.arguments?.template

    const isWhatsAppWindowOpen = useMemo(
        () => checkIsWhatsAppWindowOpen(customerMessagesList.toJS()),
        [customerMessagesList],
    )

    const dispatch = useAppDispatch()

    const cleanupEditorState = useCallback(() => {
        const editorState = EditorState.createEmpty()
        dispatch(
            setResponseText(
                fromJS({
                    contentState: editorState.getCurrentContent(),
                    selectionState: editorState.getSelection(),
                }),
            ),
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
        channel === TicketChannel.WhatsApp &&
        isPublicNewMessage &&
        selectedTemplateType === TemplateTypeFilterOption.Templates

    return (
        <Context.Provider
            value={{
                selectedTemplateType,
                setSelectedTemplateType,
                showWhatsAppTemplateEditor,
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
