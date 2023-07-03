import React, {createContext, useContext, useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {TemplateTypeFilterOption} from 'pages/tickets/detail/components/ReplyArea/TemplateTypeFilterDropdown'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    getNewMessageChannel,
    getNewMessageExternalTemplateAction,
} from 'state/newMessage/selectors'
import {TicketChannel} from 'business/types/ticket'

export type WhatsAppEditorContextState = {
    selectedTemplateType: TemplateTypeFilterOption
    setSelectedTemplateType: (templateType: TemplateTypeFilterOption) => void
    setIsTemplateListCollapsed: (isCollapsed: boolean) => void
    showWhatsAppTemplateEditor: boolean
    whatsAppMessageTemplatesEnabled: boolean
    isTemplateListCollapsed: boolean
    isFreeFormWhatsAppMessage: boolean
}

const Context = createContext<WhatsAppEditorContextState>({
    selectedTemplateType: TemplateTypeFilterOption?.Templates,
    setSelectedTemplateType: () => {
        return
    },
    setIsTemplateListCollapsed: () => {
        return
    },
    showWhatsAppTemplateEditor: false,
    whatsAppMessageTemplatesEnabled: false,
    isTemplateListCollapsed: false,
    isFreeFormWhatsAppMessage: false,
})

export const useWhatsAppEditor = (): WhatsAppEditorContextState =>
    useContext(Context)

export const WhatsAppEditorProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const [selectedTemplateType, setSelectedTemplateType] =
        useState<TemplateTypeFilterOption>(TemplateTypeFilterOption.Templates)
    const [isTemplateListCollapsed, setIsTemplateListCollapsed] =
        useState(false)

    const whatsAppMessageTemplatesEnabled =
        useFlags()[FeatureFlagKey.WhatsAppMessageTemplates]

    const externalTemplateAction = useAppSelector(
        getNewMessageExternalTemplateAction
    )
    const channel = useAppSelector(getNewMessageChannel)

    const showWhatsAppTemplateEditor =
        whatsAppMessageTemplatesEnabled &&
        channel === TicketChannel.WhatsApp &&
        selectedTemplateType === TemplateTypeFilterOption.Templates

    const isFreeFormWhatsAppMessage =
        isTemplateListCollapsed && !externalTemplateAction?.arguments?.template

    return (
        <Context.Provider
            value={{
                selectedTemplateType,
                setSelectedTemplateType,
                isFreeFormWhatsAppMessage,
                showWhatsAppTemplateEditor,
                whatsAppMessageTemplatesEnabled,
                isTemplateListCollapsed,
                setIsTemplateListCollapsed,
            }}
        >
            {children}
        </Context.Provider>
    )
}
