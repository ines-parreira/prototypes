import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {EditorState} from 'draft-js'
import {fromJS} from 'immutable'
import {TemplateTypeFilterOption} from 'pages/tickets/detail/components/ReplyArea/TemplateTypeFilterDropdown'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    getNewMessageActions,
    getNewMessageChannel,
    getNewMessageExternalTemplateAction,
} from 'state/newMessage/selectors'
import {TicketChannel} from 'business/types/ticket'
import {setNewMessageActions, setResponseText} from 'state/newMessage/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {mergeActionsJS} from 'state/ticket/utils'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import {getTicket} from 'state/ticket/selectors'
import {clearAppliedMacro} from 'state/ticket/actions'
import {createApplyExternalTemplateAction} from './utils'
import {WhatsAppMessageTemplateSearchFilters} from './WhatsAppMessageTemplateSearch'

export type WhatsAppEditorContextState = {
    selectedTemplateType: TemplateTypeFilterOption
    setSelectedTemplateType: (templateType: TemplateTypeFilterOption) => void
    setIsTemplateListVisible: (isCollapsed: boolean) => void
    selectNewTemplate: (template: WhatsAppMessageTemplate) => void
    setSearchFilter: (
        searchFilter: WhatsAppMessageTemplateSearchFilters
    ) => void
    cleanupEditorState: () => void
    showWhatsAppTemplateEditor: boolean
    whatsAppMessageTemplatesEnabled: boolean
    isTemplateListVisible: boolean
    selectedTemplate?: WhatsAppMessageTemplate
    isNewTicket: boolean
    searchFilter: WhatsAppMessageTemplateSearchFilters
}

const Context = createContext<WhatsAppEditorContextState>({
    selectedTemplateType: TemplateTypeFilterOption?.Templates,
    setSelectedTemplateType: () => {
        return
    },
    setIsTemplateListVisible: () => {
        return
    },
    selectNewTemplate: () => {
        return
    },
    setSearchFilter: () => {
        return
    },
    cleanupEditorState: () => {
        return
    },
    showWhatsAppTemplateEditor: false,
    whatsAppMessageTemplatesEnabled: false,
    isTemplateListVisible: false,
    selectedTemplate: undefined,
    isNewTicket: false,
    searchFilter: {
        language: [],
        name: '',
    },
})

export const useWhatsAppEditor = (): WhatsAppEditorContextState =>
    useContext(Context)

export const WhatsAppEditorProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const [searchFilter, setSearchFilter] =
        useState<WhatsAppMessageTemplateSearchFilters>({
            language: [],
            name: '',
        })

    const ticket = useAppSelector(getTicket)
    const isNewTicket = !ticket.id
    const [isTemplateListVisible, setIsTemplateListVisible] =
        useState(isNewTicket)
    const [selectedTemplateType, setSelectedTemplateType] =
        useState<TemplateTypeFilterOption>(
            isNewTicket
                ? TemplateTypeFilterOption.Templates
                : TemplateTypeFilterOption.Macros
        )

    const channel = useAppSelector(getNewMessageChannel)

    const whatsAppMessageTemplatesEnabled =
        useFlags()[FeatureFlagKey.WhatsAppMessageTemplates]

    const currentActions = useAppSelector(getNewMessageActions)
    const externalTemplateAction = useAppSelector(
        getNewMessageExternalTemplateAction
    )
    const selectedTemplate = externalTemplateAction?.arguments?.template

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
        if (selectedTemplateType === TemplateTypeFilterOption.Templates) {
            setIsTemplateListVisible(true)
        }
    }, [selectedTemplateType])

    useEffect(() => {
        if (!isNewTicket && !externalTemplateAction?.arguments?.template) {
            setSelectedTemplateType(TemplateTypeFilterOption.Macros)
        }
    }, [isNewTicket, externalTemplateAction])

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
                isNewTicket,
                searchFilter,
                setSearchFilter,
                cleanupEditorState,
            }}
        >
            {children}
        </Context.Provider>
    )
}
