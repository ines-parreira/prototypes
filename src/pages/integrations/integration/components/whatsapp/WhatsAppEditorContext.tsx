import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
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
    getNewMessageExternalTemplateAction,
    isNewMessagePublic,
    getNewMessageChannel,
} from 'state/newMessage/selectors'
import {TicketChannel} from 'business/types/ticket'
import {setNewMessageActions, setResponseText} from 'state/newMessage/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {mergeActionsJS} from 'state/ticket/utils'
import {WhatsAppMessageTemplate} from 'models/whatsAppMessageTemplates/types'
import {getCustomerMessages, getTicket} from 'state/ticket/selectors'
import {clearAppliedMacro} from 'state/ticket/actions'
import {
    createApplyExternalTemplateAction,
    isWhatsAppWindowOpen as checkIsWhatsAppWindowOpen,
} from './utils'
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
    isWhatsAppWindowOpen: boolean
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
    isWhatsAppWindowOpen: false,
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
